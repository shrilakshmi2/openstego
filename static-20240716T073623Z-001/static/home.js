let newurl,urlgen=false
document.getElementsByClassName('input')[0].addEventListener('click',()=>{
  document.getElementsByClassName('input_file_decode')[0].click()
})

document.getElementsByClassName('input_file_decode')[0].addEventListener('change',()=>{
    let img=document.getElementsByClassName('input_file_decode')[0].files[0]
    document.getElementsByClassName('filename_decode')[0].innerHTML=img.name
})


document.getElementsByClassName('decode_send')[0].addEventListener('click',async()=>{
    if(document.getElementsByClassName('input_file_decode')[0].files.length==0){
        document.getElementsByClassName('decodeted_text')[0].innerHTML='No file selcted'
        setTimeout(()=>{
            document.getElementsByClassName('decodeted_text')[0].innerHTML=''
        },5000)
        return
    }
    if(document.getElementsByClassName('keyinput_upload')[0].value==''){
        document.getElementsByClassName('decodeted_text')[0].innerHTML='Text cannot be empty'
        setTimeout(()=>{
            document.getElementsByClassName('decodeted_text')[0].innerHTML=''
        },5000)
        return
    }
    let form=new FormData()
    form.append('file',document.getElementsByClassName('input_file_decode')[0].files[0])
    form.append('key',document.getElementsByClassName('keyinput_upload')[0].value)
    let res=await fetch('/decode',{
        method:'POST',
        body:form
    })
    res=await res.json()
    console.log(res);
    if(res.status=='error_90089_key'){
        create_error(0)
        return
    }
    if(res.status=='error_10983404_file'){
        create_error(1)
        return
    }
    create_error(3,res.text)
})


//encoding section

document.getElementsByClassName('input_encode')[0].addEventListener('click',()=>{
    document.getElementsByClassName('input_file_encode')[0].click()
})

document.getElementsByClassName('input_file_encode')[0].addEventListener('change',()=>{
    let img=document.getElementsByClassName('input_file_encode')[0].files[0]
    document.getElementsByClassName('filename_encode')[0].innerHTML=img.name
})


document.getElementsByClassName('encode_send')[0].addEventListener('click',async()=>{
    if(document.getElementsByClassName('input_file_encode')[0].files.length==0){
        document.getElementsByClassName('msg')[0].innerHTML='No file selcted'
        setTimeout(()=>{
            document.getElementsByClassName('msg')[0].innerHTML=''
        },5000)
        return
    }
    let img=document.getElementsByClassName('input_file_encode')[0].files[0]
    if(img.type!='image/jpg'&&img.type!='image/jpeg'&&img.type!='image/png'){
        document.getElementsByClassName('msg')[0].innerHTML='File not supported'
        setTimeout(()=>{
            document.getElementsByClassName('msg')[0].innerHTML=''
        },5000)
        return
    }
    if(document.getElementsByClassName('key_enter_encode')[0].value==''){
        document.getElementsByClassName('msg')[0].innerHTML='Key cannot be empty'
        setTimeout(()=>{
            document.getElementsByClassName('msg')[0].innerHTML=''
        },5000)
        return
    }
    if(document.getElementsByClassName('text_to_encode')[0].value==''){
        document.getElementsByClassName('msg')[0].innerHTML='Text cannot be empty'
        setTimeout(()=>{
            document.getElementsByClassName('msg')[0].innerHTML=''
        },5000)
        return
    }
    let oldfile=document.getElementsByClassName('input_file_encode')[0].files[0]
    let name=`${Date.now()}${oldfile.name}`
    let newfile=new File([oldfile],name,{type:oldfile.type})

    let form=new FormData()
    form.append('key',document.getElementsByClassName('key_enter_encode')[0].value)
    form.append('text',document.getElementsByClassName('text_to_encode')[0].value)
    form.append('file',newfile)
    addloading()
    let res=await fetch('/encode',{
        method:'POST',
        body:form
    })
    res=await res.json()
    if(!res.name){
        alert('something went wrong')
    }
    removeloading()
    setdownloadlink(res.name)
    document.getElementsByClassName('msg')[0].innerHTML='You may now download the image'
})

//errors
function create_error(mode,msg){
    let popup=document.createElement('div')
    popup.className='error_popup'
    popup.style='height:100vh;width:100vw;'
    if(mode==0){
        popup.innerHTML=`<div class='inner_div'><img src='/static/pngwing.com.png' onclick='remove_pop()'>
        <h2 class='error'>Error</h2>
    <p class='error_msg'>You have entered the wrong key</p>
    </div>`
    }
    else if(mode==1){
        popup.innerHTML=`<div class='inner_div'><img src='/static/pngwing.com.png' onclick='remove_pop()'>
        <h2 class='error'>Error</h2>
        <p class='error_msg'>The file was not found</p>
        <pre>*note that the file encoded form our website is only decodable here</pre></div>`
    }
    else{
        popup.innerHTML=`<div class='inner_div'><img src='/static/pngwing.com.png' onclick='remove_pop()'>
        <h2 class='success'>Success</h2>
        <p class='the_msg_is'>The msg is</p>
        <p class='The_msg'>${msg}</p></div>
        `
    }
    document.getElementsByClassName('decode')[0].append(popup)
}

function remove_pop(){
    document.getElementsByClassName('error_popup')[0].remove()
}

async function setdownloadlink(file){
    document.getElementsByClassName('download')[0].addEventListener('click',async()=>{
        let res=await fetch(`/static/images/${file}`,{cache:'no-store'})
        res=await res.blob()
        saveAs(res,`${file}`)
    })
}

function setdownload(a){
   
}

function addloading(){
    let load=document.createElement('div')
    load.id='load'
    load.style=`position:absolute;height:100vh;width:100vw`
    load.innerHTML='<img src=/static/load-8510_256.gif alt="loading">' 
    document.body.append(load)
}
function removeloading(){
    document.getElementById('load').remove()
}

document.addEventListener('beforerelaod',()=>{
    URL.revokeObjectURL(newurl)
})