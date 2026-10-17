"""H052有限監査の対象固有runner。製品runtime/CIではない。"""
from __future__ import annotations
import argparse
import copy
import hashlib
import importlib.util
import json
from pathlib import Path

L8_REL=Path('docs/helix-harness/L8-unit-verification/command-meaning-identity.json')
L5_REL=Path('docs/helix-harness/L5-detail-design/command-meaning-identity.json')
L4_REL=Path('docs/helix-harness/L4-basic-design/command-meaning-identity.json')
L9_REL=Path('docs/helix-harness/L9-integration-verification/command-meaning-identity.json')
SECTION='owner_source_fn0_oracles'
PURE_REL=Path('docs/governance/audits/source-rebaseline/source-snapshots/h052-owner-source-finite-calculation.py')
PURE_SHA256='a9fddcd8bb0ae2904165d8c15a47bf4f61946ef474c86ee84729961d4944dd71'
ADAPTER_REL=Path('docs/governance/audits/source-rebaseline/source-snapshots/h052-owner-source-fixture-adapter.py')
ADAPTER_SHA256='2d5fb20dfd521104cbd31d7e174d842d907d30cd199f5863bbcae527a456d0b4'
FIXED_CASES={
 'normal':('9f2b500d2e3604b9f25cacc6471df13b6b93fbe9f259359e3b1069f8eed06d35','63e8fbc04a6ef925267ae20bbc10953b8290d28933d94999640e8043052939a1'),
 'N01-old-member-missing':('9be1713d1556f62d21ab79d0229b428799fe4a5a92cc39db08cf892c0ea6e1a4','107d20c7036e8489b7b573aecc46b1fe600b82112ddf4b877fcf5f254165f265'),
 'N02-target-role-omitted':('0a261e278ec991280354544dd50f371ffdbcc8c552fc0be0c338519ca3a93537','a188abda8ac7802cc0b9e336bf34e10b800df0d99b63da85d6b9179177af05dc'),
 'N03-target_read-conflict':('2c985cbd1152af70a7c44bba95e8f79d080e44cc6329e600d9113941f4378616','92f3790b9e8b31918bc1eede2f440960d09a5a3f0dd9a69073738df8e45f97f3'),
 'N04-target_qualification-conflict':('cbe01387c28d65013a393ee6cac1268e5393c35fad818fab353407e464ba8f3e','40623e3d1b258e7e03d30fab6c9128ed47992b0e6f917dd19014373a46f17b09'),
 'N05-target_root-conflict':('464d9fb168977bbadb73bb53c5b111fdf8bf8e8264c7d455a98e55c0dac2135b','43d42efc5f1f692e5f6a421b2cf16fdd7eaf7233e8e2382ca0944315be775d3d'),
 'N06-target-subject-compound':('e3a5c5d5b0ca6d23812f537c1d983443950f1980cfaa6a71dcc9617fecb65485','c0e4d7fb03eea642270b2a682c0cbb37995c2faff277c2519b0713a47537b174'),
 'N07-resolution-identical-repeat':('9b10455221d70b65988ca3699394a7f0c8b0f859299898274310045b305a7ac3','d28b596b1d740c58d15b8a772e39ced3e0b28944f31171184b3593f54dc2cef8'),
 'N08-resolution-known-state-difference':('5170f8f1ed7664879e92232b12f6659a6dd664a302db57d1aae0be28d01efc23','f9c11b7f24f0729a63f1c5d79c51d7cc40fa014b98f2a35396db95ac9b0a7766'),
 'N09-map-bytes-difference':('bd78ef00da9da9f76512e1a0679a5a92a5854d8d724437c6943dc39bd1b3cc4c','a9b8eed613bb7d598a5ba500b099ddbbd8ceddce157ca086062c91e4c31216e6')}
FIXED_CASE_ORDER=tuple(FIXED_CASES)

def root_dir():
 for candidate in Path(__file__).resolve().parents:
  if all((candidate/p).is_file() for p in (L8_REL,L5_REL,L4_REL)):
   return candidate
 raise RuntimeError('repository root not found')

def sha(raw): return hashlib.sha256(raw).hexdigest()
def canonical(value): return json.dumps(value,sort_keys=True,ensure_ascii=False,separators=(',',':'),allow_nan=False).encode('utf-8')
def typed_equal(a,b):
 if type(a) is not type(b): return False
 if type(a) is dict: return a.keys()==b.keys() and all(typed_equal(a[k],b[k]) for k in a)
 if type(a) in (tuple,list): return len(a)==len(b) and all(typed_equal(x,y) for x,y in zip(a,b))
 return a==b
def differences(a,b,p=''):
 if type(a) is not type(b): return [{'pointer':p,'reason':'型が異なる'}]
 if type(a) is dict:
  out=[]
  for k in sorted(set(a)|set(b)):
   q=p+'/'+k.replace('~','~0').replace('/','~1')
   if k not in a or k not in b: out.append({'pointer':q,'reason':'member presence differs','actual_present':k in a,'expected_present':k in b})
   else: out.extend(differences(a[k],b[k],q))
  return out
 if type(a) is list:
  if len(a)!=len(b): return [{'pointer':p,'reason':'配列長が異なる'}]
  return [d for i,(x,y) in enumerate(zip(a,b)) for d in differences(x,y,p+'/'+str(i))]
 return [] if a==b else [{'pointer':p,'reason':'値が異なる','actual':a,'expected':b}]

def decode_pointer(pointer):
 if pointer=='': return []
 if not isinstance(pointer,str) or not pointer.startswith('/'): raise ValueError('RFC 6901 pointer required')
 result=[]
 for part in pointer[1:].split('/'):
  decoded=''; i=0
  while i<len(part):
   if part[i]=='~':
    if i+1>=len(part) or part[i+1] not in '01': raise ValueError('invalid RFC 6901 escape')
    decoded += '/' if part[i+1]=='1' else '~'; i+=2
   else: decoded+=part[i]; i+=1
  result.append(decoded)
 return result

def index(token,length,allow_end=False):
 if not token or not token.isascii() or not token.isdigit() or (token!='0' and token.startswith('0')): raise ValueError('invalid array index')
 n=int(token); high=length if allow_end else length-1
 if n>high: raise IndexError('array index out of range')
 return n

def parent_at(doc,tokens):
 node=doc
 for token in tokens[:-1]: node=node[index(token,len(node))] if isinstance(node,list) else node[token]
 return node,tokens[-1]

def apply_patch(doc,ops):
 out=copy.deepcopy(doc)
 for op in ops:
  if set(op)-{'op','path','value'} or 'op' not in op or 'path' not in op: raise ValueError('invalid patch operation shape')
  kind,path=op['op'],op['path']; has_value='value' in op
  if kind not in ('add','remove','replace'): raise ValueError('unsupported operation')
  if (kind in ('add','replace'))!=has_value: raise ValueError('operation value shape mismatch')
  tokens=decode_pointer(path)
  if not tokens:
   if kind!='replace': raise ValueError('root pointer permits replace only')
   out=copy.deepcopy(op['value']); continue
  node,key=parent_at(out,tokens)
  if isinstance(node,list):
   if kind=='add':
    if key=='-': node.append(copy.deepcopy(op['value']))
    else: node.insert(index(key,len(node),allow_end=True),copy.deepcopy(op['value']))
   elif kind=='remove': node.pop(index(key,len(node)))
   else: node[index(key,len(node))]=copy.deepcopy(op['value'])
  else:
   if kind=='add': node[key]=copy.deepcopy(op['value'])
   elif key not in node: raise KeyError('patch target member missing')
   elif kind=='remove': del node[key]
   else: node[key]=copy.deepcopy(op['value'])
 return out

def load_fixed_audit_module(module_id,root):
 if module_id=='pure_calculation': rel,expected=PURE_REL,PURE_SHA256
 elif module_id=='fixture_adapter': rel,expected=ADAPTER_REL,ADAPTER_SHA256
 else: raise ValueError('unknown fixed audit module')
 path=root/rel
 if sha(path.read_bytes())!=expected: raise AssertionError('fixed module bytes changed before load')
 spec=importlib.util.spec_from_file_location('h052_owner_source_'+module_id,path)
 if spec is None or spec.loader is None: raise RuntimeError('fixed audit source cannot be loaded')
 module=importlib.util.module_from_spec(spec); spec.loader.exec_module(module); return module

def main():
 parser=argparse.ArgumentParser(); parser.add_argument('--output',required=True); args=parser.parse_args()
 root=root_dir(); l8=json.loads((root/L8_REL).read_text(encoding='utf-8')); l5=json.loads((root/L5_REL).read_text(encoding='utf-8'))
 section=l8[SECTION]; l4b=l8['current_l4_binding']; l5b=l8['candidate_l5_binding']
 if l4b.get('path')!=str(L4_REL) or sha((root/L4_REL).read_bytes())!=l4b.get('body_sha256'): raise AssertionError('現L4 binding不一致')
 if l5b.get('path')!=str(L5_REL) or sha((root/L5_REL).read_bytes())!=l5b.get('sha256'): raise AssertionError('現候補L5 binding不一致')
 basic=l5['current_basic_binding']; l9ref=l5['current_l9_candidate_binding']
 if basic.get('path')!=str(L4_REL) or sha((root/L4_REL).read_bytes())!=basic.get('file_sha256'): raise AssertionError('L5 current_basic_binding不一致')
 if l9ref.get('path')!=str(L9_REL) or sha((root/L9_REL).read_bytes())!=l9ref.get('candidate_sha256'): raise AssertionError('L5 current_l9_candidate_binding不一致')
 specs=section['audit_sources']
 fixed=(('pure_calculation',PURE_REL,PURE_SHA256),('fixture_adapter',ADAPTER_REL,ADAPTER_SHA256))
 for key,rel,digest in fixed:
  rec=specs[key]
  if rec.get('path')!=str(rel) or rec.get('sha256')!=digest or sha((root/rel).read_bytes())!=digest: raise AssertionError('固定監査source pin不一致: '+key)
 # Both source files are hash-checked before either fixed module is loaded.
 pure=load_fixed_audit_module('pure_calculation',root); adapter=load_fixed_audit_module('fixture_adapter',root)
 frozen=section['frozen_materialization']; rows=frozen['cases']; ids=[r.get('case_id') for r in rows]
 if tuple(ids)!=FIXED_CASE_ORDER: raise AssertionError('有限監査の固定case ID/順序不一致')
 results=[]
 for row in rows:
  case=row['case_id']; raw_pin,expected_pin=FIXED_CASES[case]
  if row.get('input_canonical_sha256')!=raw_pin or row.get('expected_canonical_sha256')!=expected_pin: raise AssertionError('固定case hash宣言不一致: '+case)
  original=apply_patch(frozen['shared_raw_input_base'],row['input_patch']); expected=apply_patch(frozen['shared_expected_base'],row['expected_patch'])
  input_hash=sha(canonical(original)); expected_hash=sha(canonical(expected))
  if input_hash!=raw_pin or expected_hash!=expected_pin: raise AssertionError('展開case全値hash不一致: '+case)
  native=adapter.decode_input(original); snapshot=copy.deepcopy(native); returned=pure.validate_command_input(native)
  if not typed_equal(native,snapshot): raise AssertionError('入力carrierが変更された: '+case)
  actual=adapter.encode_return(returned); actual_hash=sha(canonical(actual)); delta=differences(actual,expected)
  results.append({'case_id':case,'input_canonical_sha256':input_hash,'actual_canonical_sha256':actual_hash,'expected_canonical_sha256':expected_hash,'whole_hash_equal':actual_hash==expected_hash,'typed_presence_equal':not delta,'original_carrier_unchanged':True,'differences':delta})
 passed=len(results)==10 and all(x['whole_hash_equal'] and x['typed_presence_equal'] for x in results)
 report={'status':'PASS' if passed else 'FAIL','scope':'H052有限10caseの宣言照合のみ。製品runtime/CI/authorityの証明ではない。','results':results}
 Path(args.output).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'status':report['status'],'case_count':len(results)},ensure_ascii=False))
 if not passed: raise SystemExit(1)
if __name__=='__main__': main()
