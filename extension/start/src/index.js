import axios from '../node_modules/axios';

// form fields
const form = document.querySelector('.form-data');
const region = document.querySelector('.region-name');
const apiKey = document.querySelector('.api-key');

// results divs
const errors = document.querySelector('.errors');
const loading = document.querySelector('.loading');
const results = document.querySelector('.results-container');
const usage = document.querySelector('.carbon-usage');
const fossilfuell = document.querySelector('.fossil-fuel');
const myregion = document.querySelector('.my-region');
const clearBtn = document.querySelector('.clear-btn');

//call the API
async function displayCarbonUsage(apiKey, region){
    try{
        await axios
        .get(`https://api.co2signal.com/v1/latest`, {
            params: {
                countryCode: region,
            },
            headers: {
                'auth-token': apiKey,
            },
        })
        .then((response)=>{
            let CO2 = Math.floor(response.data.data.carbonIntensity);

            calculateColor(CO2);

            //calc color of co2
            loading.style.display = 'none';
            form.style.display = 'none';
            myregion.textContent = region;
            usage.textContent = 
                Math.round(response.data.data.carbonIntensity) + 'grams (grams CO2 emitted per kilowatt hour) ';
                fossilfuell.textContent = response.data.data.fossilFuelPercentage.toFixed(2) + '% (percentagbe of fossil fuels used to generate electricity)';
            results.style.display = 'block';
        })
    }catch(error){
        console.log(error);
        loading.style.display = 'none';
        results.style.display = 'none';
        errors.textContent = 'An error occured.';
    }
}

//set up user's api key and region
function setUpUser(apiKey, region){
    //set in local storage
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('regionName', region);
    loading.style
    errors.textContent = '';
    clearBtn.style.display = 'block';
    //make initial call
    displayCarbonUsage(apiKey, region);
}

// handle form submission
function handleSubmit(e){
    e.preventDefault();
    setUpUser(apiKey.value, region.value);
}


//3 initial checks
function init(){
    //if anything is in localStoragem, pick it up
    const storedApieKey = localStorage.getItem('apiKey');
    const storedRegion = localStorage.getItem('regionName');

    //set icon to green
    chrome.runtime.sendmessage({
        action: 'updateIcon',
        value: {color: 'green',}
    });

    if (storedApieKey === null || storedRegion === null){
        form.style.display = 'block';
        results.style.display = 'none';
        loading.style.display = 'none';
        clearBtn.style.display = 'none';
        errors.textContent ='';
    }else {
        //if keys or region present in localstorage, show em
        displayCarbonUsage(storedApieKey, storedRegion);
            results.style.display = 'none'
            form.style.display = 'none';
            clearBtn.style.display = 'block';
    }
}

function reset(e){
    e.preventDefault();
    //clear region
    localStorage.removeItem('regionName');
    init();
}

function calculateColor(value){
    let co2Scale = [0,150,600,750,800];
    let colors = ['#2AA364', '#F5EB4D', '#9E4229', '#381D02', '#391D02'];

    let closestNum = co2Scale.sort ((a,b) => { 
        return Math.abs(a-value) - Math.abs(b-value);
        })[0];
    console.log(value + 'is closest to' + closestNum);
    let scaleIndex = co2Scale.findIndex(num);

    let closestColor = colors
    console.log(scaleIndex, closestColor);

    chrome.runtime.sendmessage({action: 'updateIcon', value: {color: closestColor}});

}


//event listeners
form.addEventListener('submit', (e) => handleSubmit(e));
clearBtn.addEventListener('click', () => reset(e));
init();