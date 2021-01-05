
const Web3 = require('web3');
const abi = require("./abi.json");

const INCREMENT = 5000
const endBlock = 7028323
const startBlock = 6607985
let tmpStart = startBlock
let tmpEnd = tmpStart + INCREMENT

var counterOfKitties = {}
var noOfEvents = 0
const PROJECT_ID = ""

const address = "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d"
let web3 = new Web3(`https://mainnet.infura.io/v3/${PROJECT_ID}`)

var contract = new web3.eth.Contract(abi, address)


const assignKitty = matronId => {
    if(matronId in counterOfKitties) {
        counterOfKitties[matronId] += 1
    } else {
        counterOfKitties[matronId] = 1
    }
}

const getMatron = kitties => {
    let maxValues = []
    let stackLimit = 3
    let noOfAppereances
    for (const key in kitties) {

        noOfAppereances = kitties[key]

        if(maxValues.length === 0){
            maxValues.push({[noOfAppereances]: [key]})
        }
        else {
            if(noOfAppereances > Object.keys(maxValues[0])[0]){
                if(maxValues.length >= stackLimit) {
                    maxValues.pop()
                }
                maxValues.splice(0,0,{[noOfAppereances]: [key]})
            } else if(noOfAppereances == Object.keys(maxValues[0])[0]) {
                maxValues[0][noOfAppereances].push(key)
            }
            else {
                continue
            }
        }
    }
    return maxValues
}

const findMostFertileMatron = async () => {

    while(tmpStart < endBlock) {

        var events = await contract.getPastEvents(
            "Birth", 
            {fromBlock: tmpStart, toBlock: tmpEnd}
        )
        
        events.forEach(event => {
            let matronId = event.returnValues.matronId.toString()
            assignKitty(matronId)
            noOfEvents += 1
        });
    
        diffBlock = endBlock - tmpStart - INCREMENT
        tmpStart = tmpEnd + 1

        if(diffBlock > INCREMENT) {
            tmpEnd += INCREMENT
        } else {
            tmpEnd += diffBlock + 1
        }
        let progress = (tmpEnd - startBlock)/(endBlock - startBlock)
        console.log(`Progress: ${(progress*100).toString().slice(0,4)}%`)
    }
    delete counterOfKitties[0]
    console.log(
        `Number of 'Birth' events that happend 
    between blocks ${startBlock} and ${endBlock} is: ${noOfEvents}`)

    let theMatrons = getMatron(counterOfKitties)
    
    Object.values(theMatrons[0])[0].forEach(async id => {
        let kittyObject = await getKitty(id)
        console.log(
            `Kitty ${id} has genes[${kittyObject.genes}], 
            generation[${kittyObject.generation}], 
            and birthTime[${kittyObject.birthTime}]`
            )
    })
    
}

const getKitty = async kitty => {
    let kittyObj = await contract.methods.getKitty(kitty).call()
    return kittyObj
}

findMostFertileMatron()
