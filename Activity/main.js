// npm install puppeteer
let puppeteer = require("puppeteer");
let fs = require("fs");
let path = require("path");

let PDFDocument = require('pdfkit');

// Three links which i am going to scrap today ------> 
/* 1) Aarogya Setu
   2) DelhiFightscorona
   3) whatsapp
*/

let links = ["https://www.mygov.in/corona-data/covid19-statewise-status/","https://delhifightscorona.in/data/hospital-beds/","https://web.whatsapp.com/"];

console.log("Before");
try{
(async function () {
    let browserInstance = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized",]
    });

    
    let resultStore1 = []
    // Data scrapped from website Aarogya Setu and stored in array(coronaData)
    let coronaData = await extractData(links[0],browserInstance,resultStore1);

    //console.log(coronaData);

    let resultStore2=[];
    // Data scrapped from website delhifightscorona and stored in array(coronaHospital)
    let coronaHospital = await extractHospitalData(links[1],browserInstance,resultStore2);

   // console.log(coronaHospital);
 
    let newPage = await browserInstance.newPage();
    await newPage.goto(links[1]);
    
    let resultStore3 = [];
    // Bed Aavailability Data scrapped from website delhifightscorona and stored in (coronaBeds)
    let coronaBeds = await extractBeds(resultStore3,newPage);
    //console.log(coronaBeds);
    let resultStore4 = [];
    for(let i =0;i<coronaBeds.length;i++){
        resultStore4.push(coronaBeds[i].split("\n"));
    }


    // ```````````````````````This section is for creating PDF and storing all the data which i scrappped  till now ````````````````````````````````````````````
    

    let repoName = "Important Information Corona"
    let filePath = path.join(__dirname,repoName+".pdf");
    let pdfDoc = new PDFDocument;
    pdfDoc.pipe(fs.createWriteStream(filePath));
    pdfDoc
    .fontSize(25)
    .text(JSON.stringify(coronaData));
    pdfDoc
    .addPage()
    .fontSize(25)
    .text(JSON.stringify(coronaHospital));
    pdfDoc
    .addPage()
    .fontSize(25)
    .text(JSON.stringify(resultStore4));
    pdfDoc.end();



    //```````````````````````Opening the last website which is whatsapp``````````````````````````````
    let newTab = await browserInstance.newPage();
    await newTab.goto(links[2]);
    await newTab.waitForSelector("span[title = 'Friend1']");
    const target = await newTab.$("span[title = 'Friend1']");
    await target.click();
    newTab.setDefaultNavigationTimeout( 90000 );
    const input = await newTab.$("#main > footer > div.copyable-area  >div._2A8P4 >div._1JAUF > div.copyable-text.selectable-text");
    await input.type("Hi  ",{delay:200});
    await input.type("Yes sure  ",{delay:200});
    await input.type("I am sending you the information regarding Hospitals",{delay:200});
    await newTab.keyboard.press("Enter");

    await newTab.waitForSelector('#main > footer > div.copyable-area div._2n-zq');
    const target_click = await newTab.$("#main > footer > div.copyable-area div._2n-zq");
    await target_click.click();

    await newTab.waitForSelector('#main > footer > div.copyable-area > div._23e-h > div._2C9f1 >div._3zHcq li._2iavx input[type=file]')
    const att = await newTab.$("#main > footer > div.copyable-area > div._23e-h > div._2C9f1 >div._3zHcq li._2iavx input[type=file]");

    att.uploadFile('Important Information Corona.pdf');
    newTab.setDefaultNavigationTimeout( 90000 );
    await newTab.waitForSelector("span[data-testid=send]");
    const finalTarget = await newTab.$("span[data-testid=send]");
    await finalTarget.click();


})();// IFEE concept 

}
catch(err){
    console.log(err);
}



async function extractData(link,browserInstance,resultStore1){
    let newPage = await browserInstance.newPage();
    await newPage.goto(link);

    function gettingData(resultStore1){
        let obj1 = document.querySelector(".field.field-name-field-last-total-active.field-type-number-integer.field-label-above").innerText.split("\n");
        let obj2 = document.querySelector(".field.field-name-field-last-total-cured.field-type-number-integer.field-label-above").innerText.split("\n");
        let obj3  = document.querySelectorAll(".field.field-name-field-total-confirmed-indians.field-type-number-integer.field-label-above .field-item.even")[8].innerText;
        let obj4 = document.querySelectorAll(".field.field-name-field-cured.field-type-number-integer.field-label-above .field-item.even")[8].innerText;
        let obj5 = document.querySelectorAll(".field.field-name-field-deaths.field-type-number-integer.field-label-above .field-item.even")[8].innerText;
        let obj6 = document.querySelectorAll(".field-items .field-item.even a")[8].getAttribute("href");
        resultStore1.push("``````INFORMATION``````````````````````````````");
        resultStore1.push("In India "+obj1);
        resultStore1.push("In India "+obj2);
        resultStore1.push("Total confiremed cases in Delhi "+obj3);
        resultStore1.push("Total cured cases in Delhi "+obj4);
        resultStore1.push("Total Death in Delhi "+obj5);
        resultStore1.push("whatsapp link for Delhi Government-Corona Helpline : "+obj6);
        return resultStore1;

    
        

    }
   // Here we are evaluting the current page with the above defined function gettingData
   return await newPage.evaluate(gettingData,resultStore1);

}


async function waitAndClick(selector, newTab) {
    // here we are waiting for the selector 
    await newTab.waitForSelector(selector, { visible: true });
    // we didn't wait this promise because we want  the calling perspn to await this promise based async function 
    let selectorClickPromise = newTab.click(selector);
    return selectorClickPromise;
}

async function extractHospitalData(link,browserInstance,resultStore2){

    let newPage = await browserInstance.newPage();
    await newPage.goto(link);
    

    function gettingBeds(resultStore2){

        let obj1 = document.querySelectorAll(".col .card-body .card-text")[0].innerText;
        let obj2 = document.querySelectorAll(".col .card-body .card-text")[1].innerText;
        let obj3 = document.querySelectorAll(".col .card-body .card-text")[2].innerText;
        let obj4 = document.querySelectorAll(".col .card-body .card-text")[3].innerText;
        let obj5 = document.querySelectorAll(".col .card-body .card-text")[4].innerText;
        let obj6 = document.querySelectorAll(".col .card-body .card-text")[5].innerText;
     
        resultStore2.push("````Hospital Beds in Delhi``````````````````````````````");
        resultStore2.push("Total Covid-19 Beds availible in Delhi -> "+obj1);
        resultStore2.push("Total Covid-19 Beds occupied in Delhi -> "+obj2);
        resultStore2.push("Total Covid-19 Beds vacant in Delhi -> "+obj3);
    
        resultStore2.push("Total Covid-19 ICU Beds availible in Delhi -> "+obj4);
        resultStore2.push("Total Covid-19 ICU Beds occupied in Delhi -> "+obj5);
        resultStore2.push("Total Covid-19 ICU Beds vacant in Delhi -> "+obj6);
    
        return resultStore2;
    }

    // Here we are evaluting the current page with the above defined function gettingBeds
    return await newPage.evaluate(gettingBeds,resultStore2);
}


async function extractBeds(resultStore3,newPage){
    // here we are going to the next page from the current page
    await waitAndClick(".col a",newPage);

    function gettingBedsData(resultStore3){

        let k =1;
        resultStore3.push("````````````````````````INFORMATION``````````````````");
        resultStore3.push("```````Hospital Name"+"   "+"Phone numbers"+"   "+"View Locations"+"  "+"Update Timing"+"  "+"Total Beds"+"  "+"Vacant```````````````````");
        for(let i =0;i<10;i++){
        let obj1 = document.querySelectorAll(".card.shadow.m-1.mb-2 ")[i].innerText
        let obj2 = document.querySelectorAll(".table-success")[k+i].innerText.split("\t")
        resultStore3.push(i+1+"-->"+obj1+""+obj2+" us.");
        resultStore3.push("``````````````````````````````````````````````````````");
       
        }
        return resultStore3;
    }
    
    await newPage.waitForSelector(".card.shadow.m-1.mb-2");
    // Here we are evaluting the current page with the above defined function gettingBedsData
    return await newPage.evaluate(gettingBedsData,resultStore3);

 R

}




console.log("end");

