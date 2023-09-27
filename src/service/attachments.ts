import pako from 'pako';
import {getAttachment, saveAttachment} from "./indexedDB";


export const loadAndSaveImages = async () => {
    //const data = await fetch('http://localhost/kms/lh/file/get?item_id=JpB73AWQ0Xxz26lq');
    const src = 'http://localhost:3000/gr.jpg'
    const data = await fetch(src);
    const res = await data.arrayBuffer();
    const deflate = pako.deflate(res);
    const blob = new Blob([deflate]);
    saveAttachment(src, blob);
}


export const getImages = async () => {
    //const blob = await data.blob();
    const src = 'http://localhost:3000/gr.jpg'
    const attachment = await getAttachment(src);
    const zipArray =  await new Response(attachment.value).arrayBuffer();
    const inflate = pako.inflate(zipArray);
    const blob = new Blob([inflate])
    return {src, value: blob}
}