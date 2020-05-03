let fs=require("fs");
require("chromedriver");
let swd=require("selenium-webdriver");
let bldr=new swd.Builder();
let driver=bldr.forBrowser("chrome").build();

let cFile=process.argv[2];
let uToAdd=process.argv[3];

( async function(){
    try{
        await driver.manage().setTimeouts({implicit:30000,pageLoad:30000});
        let data=await fs.promises.readFile(cFile);
        let {user,pwd,url}=JSON.parse(data);
        //console.log(data+"");
        await driver.get(url);
        let unInputWillBeFoundPromise= driver.findElement(swd.By.css("#input-1"));
        let psInputWillBeFoundPromise= driver.findElement(swd.By.css("#input-2"));
        let unNpsEl= await Promise.all([unInputWillBeFoundPromise,psInputWillBeFoundPromise]);
        let uNameWillBeSendPromise=unNpsEl[0].sendKeys(user);
        let psWillBeSendPromise=unNpsEl[1].sendKeys(pwd);
        await Promise.all([uNameWillBeSendPromise,psWillBeSendPromise]);
        let loginBtn= await driver.findElement(swd.By.css("button[data-analytics=LoginPassword]"));
        await loginBtn.click();
        console.log("Login successful");
        console.log("************************************Reached dashboard page*********************************************************");
    }catch(err){
        console.log(err);
    }
})()