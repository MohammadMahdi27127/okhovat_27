(() => {
  const api={user:null,data:{}};
  api.request=async(path,method='GET',body)=>{
    const headers={'X-Okhovat':'1'};
    if(api.user)headers['X-Okhovat-Account']=api.user.code;
    if(body && !(body instanceof FormData)) {headers['Content-Type']='application/json';body=JSON.stringify(body);}
    const res=await fetch('/api/'+path,{method,headers,body,credentials:'same-origin',cache:'no-store'});
    if(res.status===409 && path!=='admin/members')location.reload();
    if(res.status===401 && api.user && path!=='login'){api.user=null;location.replace('/login/');}
    if(!res.ok){
      const error=await res.json().catch(()=>({}));
      throw Error(typeof error.detail==='string'?error.detail:'درخواست ثبت نشد. ورودی و ارتباط با سرور را بررسی کن.');
    }
    return res.json();
  };
  let generation=0;
  api.refresh=async()=>{
    const seq=++generation, data=await api.request('state');
    if(seq===generation){api.data=data;window.applyServerState?.();}
  };
  api.init=async()=>{
    const session=await api.request('session');
    api.user=session.user;api.attendance=session.attendance;
    if(api.user)await api.refresh();
  };
  api.upload=async(file,purpose)=>{
    if(!file?.size)return null;
    if(file.size>10485760)throw Error('حداکثر حجم فایل ۱۰ مگابایت است.');
    const form=new FormData();form.append('file',file);
    return api.request('files/'+purpose,'POST',form);
  };
  api.write=async(path,method,body)=>{
    await api.request(path,method,body);
    await api.refresh();
  };
  window.okApi=api;
})();
