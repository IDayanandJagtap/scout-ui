const chemicalNameInput = document.getElementById("chemicalName");
const casNumberInput = document.getElementById("casNumber");
const verifiedResultContainer = document.getElementById("verifiedResults");
const unverifiedResultContainer = document.getElementById("unverifiedResults");
const searchingState = document.getElementById("searchingState");
const pdfContainer = document.getElementById("viewPdfContainer");
const pdfFrame = document.getElementById("pdfFrame");
const searchBtn = document.getElementById("searchBtn");
// API URL
// replit
// const BASE_API_URL =
//     "https://41b801c7-a24d-493f-9e3f-154c2cfb6834-00-2663dwmzrq21o.pike.replit.dev:8000/";

//azure
const BASE_API_URL = "https://scout-api.azurewebsites.net/";
// Display the search results
const displayResults = (results) => {
    // Insert verified in verified container and unverified into unverified container
    verifiedResultContainer.innerHTML = "";
    unverifiedResultContainer.innerHTML = "";
    let foundVerifiedPdf = false; // To check if any verified pdf is found

    results.forEach((result) => {
        // Extract filename and create a href link
        const filename = result.filepath.split("/").pop();
        const pdfUrl = BASE_API_URL + result.filepath;

        // Create a link
        const a = document.createElement("a");
        a.className = "response-link";
        a.href = pdfUrl;
        a.textContent = "⚪  " + filename;
        a.addEventListener("click", openPdfOnLinkClick);

        // Add into respective container
        if (result.verified) {
            verifiedResultContainer.append(a);
            foundVerifiedPdf = true;
        } else {
            // Check if it has a heading already, if not then add heading first !
            if (!unverifiedResultContainer.hasChildNodes()) {
                const h1 = document.createElement("h1");
                h1.className = "text-lg font-bold";
                h1.textContent = "Suggestions";
                unverifiedResultContainer.append(h1);
            }
            unverifiedResultContainer.append(a);
        }
    });

    // If no verified pdf found, then show message
    !foundVerifiedPdf && (searchingState.textContent = "No verified PDF found");
};

// Make an API_CALL and return the results
const searchMsds = async (query) => {
    try {
        let response = await fetch(`${BASE_API_URL}scout/${query}`);
        return await response.json();
    } catch (err) {
        console.log(err.message);
        return { error: err.message };
    }
};

// Handle form submit
const handleOnFormSubmit = async (e) => {
    e.preventDefault(); //prevent default behavior

    // disable button until the results are fetched
    searchBtn.textContent = "Searching...";
    searchBtn.disabled = true;

    // cleanups (clear previous results)
    verifiedResultContainer.innerHTML = "";
    unverifiedResultContainer.innerHTML = "";
    searchingState.textContent = "";
    pdfContainer.classList.add("hidden");

    // Get values
    const chemicalName = chemicalNameInput.value;
    const casNumber = casNumberInput.value;

    if (chemicalName === "" && casNumber === "") {
        searchingState.textContent =
            "Please enter either chemical name or cas number";
        searchBtn.textContent = "Search";
        searchBtn.disabled = false;
        return;
    }

    // Get what to search for
    const valueToSearch = chemicalName || casNumber;

    // Show searching state
    searchingState.textContent = `Searching for ${valueToSearch}...`;

    // search
    const result = await searchMsds(valueToSearch);

    // Check for errors
    if (result?.error) {
        searchingState.textContent = "Something went wrong 😔";
        return;
    }

    // Show the status of the search
    if (result.length == 0) {
        searchingState.textContent = "No results found";
    } else {
        searchingState.textContent = "";
        // Insert the result in the response container
        displayResults(result);
    }

    // Re-enable button
    searchBtn.textContent = "Search";
    searchBtn.disabled = false;
};

// Handle pdf opening :

const openPdfOnLinkClick = (e) => {
    e.preventDefault();
    // Get the pdfURl and provide it to pdf frame.
    const pdfUrl = e.target.getAttribute("href");
    pdfFrame.src = pdfUrl;

    // Display the pdf viewer
    pdfContainer.classList.remove("hidden");
};

// Demo response :
// [
//     {
//       cas: '106-38-7',
//       name: null,
//       provider: 'www.cdhfinechemical.com',
//       verified: true,
//       filepath: './verified/106-38-7_www.cdhfinechemical.com_1.pdf',
//       url: 'https://www.cdhfinechemical.com/images/product/msds/37_1169066209_4-BromoToluene-CASNO-106-38-7-MSDS.pdf'
//     },
//     {
//       cas: '106-38-7',
//       name: null,
//       provider: 'www.fishersci.com',
//       verified: true,
//       filepath: './verified/106-38-7_www.fishersci.com_1.pdf',
//       url: 'https://www.fishersci.com/store/msds?partNumber=AC107481000&productDescription=4-BROMOTOLUENE+99%25+100ML&vendorId=VN00032119&countryCode=US&language=en'
//     }
//   ]
