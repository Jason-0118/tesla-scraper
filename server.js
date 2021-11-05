const PORT = process.env.PORT || 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const app = express()

//connect to mongoose DB
const credentials = require('./dbCredentials')
const mongoose = require('mongoose')
mongoose.connect(credentials.connection_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

//load models
const Vehicle = require('./models/vehicle')

//read json and parse it
var data = fs.readFileSync('./weblist.json')
var Model_webList_local = JSON.parse(data)

//variable
const list = ['https://www.edmunds.com/inventory/srp.html?make=tesla&model=model-3',
    'https://www.edmunds.com/inventory/srp.html?make=tesla&model=model-s',
    'https://www.edmunds.com/inventory/srp.html?make=tesla&model=model-x',
    'https://www.edmunds.com/inventory/srp.html?make=tesla&model=model-y']
const Model_webList = []
const individual_model = []

//function of loading vehicles into mongoDB
async function loadData() {
    await Vehicle.deleteMany()
    console.log('delete complete!')
    for (let item of individual_model) {
        const vehicle = new Vehicle(item)
        vehicle.vehicle_summary = Object.assign(item.vehicle_summary, vehicle.vehicle_summary)
        vehicle.vehicle_history = Object.assign(item.vehicle_history, vehicle.vehicle_history)
        vehicle.cc = item.cc
        vehicle.safty = item.safty
        vehicle.entertainment = item.entertainment
        vehicle.ee = item.ee
        vehicle.url = item.url
        await vehicle.save()
    }
    console.log('finish loading!')
}

app.get('/', (req, res) => {
    res.json("Welcome to the Edmund Scraper API")
})

//get all the same model vehicle weblist 
for (let i = 0; i < list.length; i++) {
    axios.get(list[i])
        .then((response) => {
            const html = response.data
            const $ = cheerio.load(html)
            $('a:contains("Tesla Model")', html).each(function () {
                const title = $(this).text()
                const url = "https://www.edmunds.com" + $(this).attr('href')
                Model_webList.push({
                    title,
                    url
                })
            })
        }).catch((err) => console.log(err))
}

//Model_webList_local read from file to get vehicles info
Model_webList_local.forEach(item => {
    axios.get(item.url)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const model = $("h1.not-opaque", html).text()
            const type = $("span.not-opaque", html).text()
            const vin_trim = $("body > div.venom-app > div > main > div.pb-md-3_25 > div.vdp-content-wrapper.container > div > div.mt-md-1.pr-xl-2.col-12.col-md-7.offset-md-0.col-lg-8 > div.vdp-group.mb-2 > section > div.font-weight-normal.mb-1_25 > div > span.mr-1").text()
            const vin = vin_trim.replace('VIN: ', '')
            const mileage = $('div.col:contains("miles")', html).text()
            const range_trim = $('.col:contains("mi electric range")', html).text()
            const range = range_trim.substring(0, range_trim.search('range') + 5)
            const report = $("body > div.venom-app > div > main > div.pb-md-3_25 > div.vdp-content-wrapper.container > div > div.mt-md-1.pr-xl-2.col-12.col-md-7.offset-md-0.col-lg-8 > div:nth-child(4) > div.row > div > section:nth-child(2) > div > ul > li:nth-child(1) > div > div").text()
            const title = $("body > div.venom-app > div > main > div.pb-md-3_25 > div.vdp-content-wrapper.container > div > div.mt-md-1.pr-xl-2.col-12.col-md-7.offset-md-0.col-lg-8 > div:nth-child(4) > div.row > div > section:nth-child(2) > div > ul > li:nth-child(4) > div").text()
            const ownerhistory = $("body > div.venom-app > div > main > div.pb-md-3_25 > div.vdp-content-wrapper.container > div > div.mt-md-1.pr-xl-2.col-12.col-md-7.offset-md-0.col-lg-8 > div:nth-child(4) > div.row > div > section:nth-child(2) > div > ul > li:nth-child(3) > div").text()
            const url_image = $("body > div.venom-app > div > main > div.pb-md-3_25 > div.vdp-content-wrapper.container > div > div.mt-md-1.pr-xl-2.col-12.col-md-7.offset-md-0.col-lg-8 > section.inventory-hero-image.px-0.mx-md-0.pos-r.d-block.row > div.aspect-ratio-container.pos-r > div > img").attr('src')
            const cc = []
            $("body > div.venom-app > div > main > div.pb-md-3_25 > div.vdp-content-wrapper.container > div > div.mt-md-1.pr-xl-2.col-12.col-md-7.offset-md-0.col-lg-8 > div:nth-child(4) > div.row > div > section.features-and-specs.text-gray-darker > div.pl-1.pl-md-0.mb-0_5.row > div:nth-child(1) > div.features-with-collapse > ul").find('li').each(function () {
                cc.push($(this).text())
            })
            const safty = []
            $("body > div.venom-app > div > main > div.pb-md-3_25 > div.vdp-content-wrapper.container > div > div.mt-md-1.pr-xl-2.col-12.col-md-7.offset-md-0.col-lg-8 > div:nth-child(4) > div.row > div > section.features-and-specs.text-gray-darker > div.pl-1.pl-md-0.mb-0_5.row > div:nth-child(3) > div.features-with-collapse > ul").find('li').each(function () {
                safty.push($(this).text())
            })
            const entertainment = []
            $("body > div.venom-app > div > main > div.pb-md-3_25 > div.vdp-content-wrapper.container > div > div.mt-md-1.pr-xl-2.col-12.col-md-7.offset-md-0.col-lg-8 > div:nth-child(4) > div.row > div > section.features-and-specs.text-gray-darker > div.pl-1.pl-md-0.mb-0_5.row > div:nth-child(2) > div.features-with-collapse > ul").find('li').each(function () {
                entertainment.push($(this).text())
            })
            const ee = []
            $("body > div.venom-app > div > main > div.pb-md-3_25 > div.vdp-content-wrapper.container > div > div.mt-md-1.pr-xl-2.col-12.col-md-7.offset-md-0.col-lg-8 > div:nth-child(4) > div.row > div > section.features-and-specs.text-gray-darker > div.pl-1.pl-md-0.mb-0_5.row > div:nth-child(4) > div.features-with-collapse > ul").find('li').each(function () {
                ee.push($(this).text())
            })
            individual_model.push({
                vehicle_summary: {
                    model,
                    type,
                    mileage,
                    range,
                    vin,
                    ownerhistory,
                    url_image
                },
                vehicle_history: {
                    report,
                    title

                },
                cc,
                safty,
                entertainment,
                ee,
                url: item.url
            })
        }).catch((err) => console.log(err))
})

//step 1: get list of source website and write it into file
app.get('/list', async (req, res) => {
    var data = JSON.stringify(Model_webList)
    fs.writeFileSync('./weblist.json', data, 'utf-8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.")
            return console.log(err)
        }
    })
    res.json(Model_webList)
})

//step 2: get vehicles info and write into file
app.get('/model', async (req, res) => {
    var data = JSON.stringify(individual_model)
    fs.writeFileSync('./vehicles.json', data, 'utf-8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.")
            return console.log(err)
        }
    })
    res.json(individual_model)
})

//step 3: load data
app.get('/load', (req, res) => {
    loadData()
})

app.get('/model/:name', (req, res) => {
    var input = req.params.name;
    Vehicle.find({ name: { $regex: input, $option: '$i' } })
        .then(data => {
            res.send(data)
        })
})

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})