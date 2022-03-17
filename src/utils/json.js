export const JSONparse = (jsonString) => {
    try{
        return JSON.parse(jsonString)
    }catch(e){
        return null
    }
}