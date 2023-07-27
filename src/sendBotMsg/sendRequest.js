'use strict'
const fetch = require('node-fetch')
const parseResponse = require('./parseResponse')

const postRequest = async(uri, body)=>{
  try{
    const res =  await fetch(uri, {
      method: 'POST',
      body: JSON.stringify(body),
      timeout: 120000,
      compress: true,
      headers: {"Content-Type": "application/json"}
    })
    return await parseResponse(res)
  }catch(e){
    if(e?.name) return {error: e.name, message: e.message, type: e.type}
    if(e?.status) return await parseResponse(e)
    console.error(e)
  }
}

const sendRequest = async(uri, body, count = 0)=>{
  try{
    const res = await postRequest(uri, body)
    if(res?.error === 'FetchError' && count < 11){
      count++
      return await sendRequest(uri, body, count)
    }
    return res
  }catch(e){
    console.error(e);
  }
}
module.exports = async(uri, body)=>{
  try{
    if(!uri) return
    const res = await sendRequest(uri, body)
    return res?.body
  }catch(e){
    console.error(e);
  }
}
