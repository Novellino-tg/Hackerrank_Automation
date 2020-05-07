let fs = require("fs");
require("chromedriver");
let swd = require("selenium-webdriver");
let bldr = new swd.Builder();
let driver = bldr.forBrowser("chrome").build();

let cFile = process.argv[2];
let questions = process.argv[3];
let quesdata = require(questions);

(async function () {
    try {
        await driver.manage().setTimeouts({ implicit: 30000, pageLoad: 35000 });
        let data = await fs.promises.readFile(cFile);
        let { user, pwd, url } = JSON.parse(data);
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
            let question = await getMeQuestionElement(qidx, mpUrl, quesdata);
            if (question == null) {
                console.log("All Question processed");
                return;
            }
            qidx++;
        }
    } catch (err) {
        console.log(err);
    }
})();

async function getMeQuestionElement(qidx, mpUrl, quesdata) {
    let pidx = Math.floor(qidx / 10);
    let pQidx = qidx % 10;
    console.log(pidx + " " + pQidx + " ");
    let reqpageurl = mpUrl + "/page/" + (pidx + 1);
    await driver.get(reqpageurl);
    await waitForLoader();
    let challengeList = await driver.findElements(swd.By.css(".backbone.block-center"));
    if (challengeList.length > pQidx) {
        await addHelper(challengeList[pQidx], quesdata[qidx]);
        return challengeList[pQidx];
    } else {
        return null;
    }
}

async function addHelper(question, qdata) {
    try {
        await waitForLoader();
        await question.click();
        await driver.wait(swd.until.elementLocated(swd.By.css('span.tag')));
        let TestCaseTab = await driver.findElement(swd.By.css('li[data-tab=testcases]'));
        await TestCaseTab.click();
        let loopcount = (qdata["Testcases"]).length;//number of test cases to be added
        // console.log(loopcount);
        for (let i = 0; i < loopcount; i++) {
            await driver.wait(swd.until.elementLocated(swd.By.css('.btn.add-testcase.btn-green')));
            let state = qdata["Testcases"][i];
            let addTestcaseButton = await driver.findElement(swd.By.css('.btn.add-testcase.btn-green'));
            await addTestcaseButton.click();

            let inputTA = await driver.findElement(swd.By.css('.formgroup.horizontal.input-testcase-row.row .CodeMirror.cm-s-default.CodeMirror-wrap div textarea'));
            let outputTA = await driver.findElement(swd.By.css('.formgroup.horizontal.output-testcase-row.row .CodeMirror.cm-s-default.CodeMirror-wrap div textarea'));
            let indata = state["Input"];
            let oudata = state["Output"];
            console.log("in data is ", indata);
            console.log("outdata is ", oudata)
            console.log("1")
            await editorHandler('.formgroup.horizontal.input-testcase-row.row .CodeMirror.cm-s-default.CodeMirror-wrap div', inputTA, indata);
            console.log("3")
            await editorHandler('.formgroup.horizontal.output-testcase-row.row .CodeMirror.cm-s-default.CodeMirror-wrap div', outputTA, oudata);
            console.log("4")
            let savebtn = await driver.findElement(swd.By.css('.btn.btn-primary.btn-large.save-testcase'));
            await savebtn.click();
            console.log("5");
            await driver.sleep(4000);
            console.log('8')
        }
    }
    catch (err) {
        console.log(err)
    }
}



async function waitForLoader() {
    let loader = await driver.findElement(swd.By.css("#ajax-msg"));
    await driver.wait(swd.until.elementIsNotVisible(loader));
}
async function editorHandler(parentSelector, element, data) {
    let parent = await driver.findElement(swd.By.css(parentSelector));
    // selenium => browser js execute 
    await driver.executeScript("arguments[0].style.height='10px'", parent);
    await element.sendKeys(data);
}
