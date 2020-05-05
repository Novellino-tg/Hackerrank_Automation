let fs = require("fs");
require("chromedriver");
let swd = require("selenium-webdriver");
let bldr = new swd.Builder();
let driver = bldr.forBrowser("chrome").build();

let cFile = process.argv[2];
let uToAdd = process.argv[3];

(async function () {
    try {
        await driver.manage().setTimeouts({ implicit: 30000, pageLoad: 35000 });
        let data = await fs.promises.readFile(cFile);
        let { user, pwd, url } = JSON.parse(data);
        //console.log(data+"");
        await driver.get(url);
        let unInputWillBeFoundPromise = driver.findElement(swd.By.css("#input-1"));
        let psInputWillBeFoundPromise = driver.findElement(swd.By.css("#input-2"));
        let unNpsEl = await Promise.all([unInputWillBeFoundPromise, psInputWillBeFoundPromise]);
        let uNameWillBeSendPromise = unNpsEl[0].sendKeys(user);
        let psWillBeSendPromise = unNpsEl[1].sendKeys(pwd);
        await Promise.all([uNameWillBeSendPromise, psWillBeSendPromise]);
        let loginBtn = await driver.findElement(swd.By.css("button[data-analytics=LoginPassword]"));
        await loginBtn.click();
        // console.log("Login successful");
        await waitForLoader();
        let adminLinkanchor = await driver.findElement(swd.By.css("a[data-analytics=NavBarProfileDropDownAdministration]"))
        let adminPageUrl = await adminLinkanchor.getAttribute("href");
        await driver.get(adminPageUrl);
        let manageTabs = await driver.findElements(swd.By.css(".administration header ul li"));
        await manageTabs[1].click();
        const mpUrl = await driver.getCurrentUrl();
        console.log(mpUrl);
        // console.log("************************************Reached Manage Challenges page*********************************************************");
        let qidx = 0;
        while (true) {
            //  => qnumber => question
            let question = await getMeQuestionElement(qidx, mpUrl, process.argv[3]);
            if (question == null) {
                console.log("All Question processed");
                return;
            }
            // await handleQuestion(question, process.argv[3]);
            await handleQuestionRemove(question, uToAdd);
            qidx++;
        }
    } catch (err) {
        console.log(err);
    }
})();

async function getMeQuestionElement(qidx, mpUrl, uToAdd) {
    let pidx = Math.floor(qidx / 10);
    let pQidx = qidx % 10;
    console.log(pidx + " " + pQidx + " ");
    let reqpageurl = mpUrl + "/page/" + (pidx + 1);
    // console.log(reqpageurl);    
    await driver.get(reqpageurl);
    await waitForLoader();
    let challengeList = await driver.findElements(swd.By.css(".backbone.block-center"));
    if (challengeList.length > pQidx) {
        return challengeList[pQidx];
    } else {
        return null;
    }
}


async function waitForLoader() {
    let loader = await driver.findElement(swd.By.css("#ajax-msg"));
    await driver.wait(swd.until.elementIsNotVisible(loader));
}


async function handleQuestion(question, uToAdd) {
    await question.click();
    await driver.sleep(9000);
    let moderatorliarr = await driver.findElements(swd.By.css(".cursor.change-tab.cep"));
    await moderatorliarr[1].click();
    let moderatorinputWillBeFound = await driver.findElement(swd.By.css("#moderator"));
    await moderatorinputWillBeFound.sendKeys(uToAdd + "\n");
    await driver.findElement(swd.By.css(".save-challenge.btn.btn-green")).click();
}


