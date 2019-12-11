/// <reference path="jQuery3.4.1.js" />

(() => {
    // Create an array for the coins I want to save
    let allCoins = [];
    // Create a list for the reports
    let reportsList = [];
    // Create an array that contain the coins i want to remove in the modal section
    let removeModal = [];

    $(() => { // Document Ready --------------------------------------------------------------------------------

        // Making the Parallex scroller background bigger when I'm scrolling down 
        $(window).scroll(function () {
            let scrollPos = $(this).scrollTop();
            $(".parallex").css({
                'background-size': 100 + scrollPos * 0.5 + '%'
            });
        });
        // Create the loading gif
        let loadGif = `<img id="loading" src="assets/loading.gif">`;
        // Common activities for the main butons ////////////////////////////////////////////////////////////////
        $(".main").click(() => {
            $("#searching").css("display", "none");
            $("section > #coins").hide();
            $("section > #reports").hide();
            $("section > #about").hide();

        });
        // About button //////////////////////////////////////////////////////////////////////////////////////////
        $("#aboutButton").click(() => {
            $("section > #about").show();
            $("section > #about").append(loadGif);
            const logoes = `<div>
            <h3>Contact Details</h3><br/>
            <a target="_blank" href="mailto:davidyf96@gmail.com">
                <img src='./assets/gmail.png' class='logo'>
            </a>
            <a target="_blank" href="https://github.com/davidelyosef">
                <img src='./assets/github.png' class='logo'>
            </a>
            <a target="_blank" href="https://www.linkedin.com/in/david-el-yosef-5736b7196">
                <img src='./assets/linkedin.png' class='logo'>
            </a>
            </div><br />`
            const projectDetails = `<p>The project is about giving information and current-time data 
            about the Cryptography market <br />
            You can search the coins in the search field, see their information and select up to 5 coins <br />
            You can see the coins you picked on a chart with real-time price.</p>`;
            const profile = `<img id="profile" src="assets/profilePic.png">`
            $("section > #about").html(projectDetails + logoes + profile);
            $("#loading").hide();
        });

        // Reports Button /////////////////////////////////////////////////////////////////////////////////////////
        $("#reportsButton").click(() => {
            $("section > #reports").show();
            if (reportsList.length < 1) {
                let msg = `<p>Please select a coin in the Coins section before you enter here</p>`;
                $("section > #reports").html(msg);
                return;
            }
            let dataPoints = [[], [], [], [], []];
            let dataForReports = [];
            let reportsLength = reportsList.length;

            // Create the chart container
            const chartContainer = `<div id="chartContainer" style="height: 500px; width: 100%;"></div>`
            $("section > #reports").html(chartContainer);
            let xValue = 0;

            let options = {
                // Display the chosen coins
                type: "spline",
                title: {
                    text: `${reportsList}`
                },
                subtitles: [{
                    text: "Live information about the coins price"
                }],
                // Axis y that represents price in Dollars
                axisY: {
                    title: "USD PRICE",
                },
                // Allow to add or remove specific coin from the chart
                legend: {
                    cursor: "pointer",
                    itemclick: toggleDataSeries
                },
                // data for the selected coins
                data: dataForReports
            };

            // set the structure of the axes without his data
            for (let i = 0; i < reportsLength; i++) {
                dataForReports.push({ type: "spline", name: `${reportsList[i]}`, showInLegend: true, dataPoints: dataPoints[i] });
            }


            // Get the API for the chosen coins
            console.log("https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + reportsList + "&tsyms=USD");
            function getData() {
                $.getJSON("https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + reportsList + "&tsyms=USD", json => {
                    // chart //////////////////////////////////////////////////////////////
                    for (let i = 0; i < reportsLength; i++) {
                        if (json[reportsList[i]] === undefined) {
                            continue;
                        }
                        // i dont want the length of the data points to be more than 10, so:
                        // shift() delete and return the first element in the array
                        let dataPointsLength = dataPoints[i].length;
                        if (dataPointsLength === 10) {
                            dataPoints[i].shift();
                        }
                        let yValue = json[reportsList[i]]["USD"];
                        dataPoints[i].push({ x: xValue, y: yValue });

                    }
                    xValue += 1;

                    $("#chartContainer").CanvasJSChart().render();

                })
            }

            
            // Create the canvas chart and input the data inside of him
            $("#chartContainer").CanvasJSChart(options);


            setInterval(getData, 2000);

        });


        // function that allow to remove or add coins to the chart
        function toggleDataSeries(e) {
            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            } else {
                e.dataSeries.visible = true;
            }
            e.chart.render();
        }


        // Coins Section //////////////////////////////////////////////////////////////////////////////////////
        $("#coinsButton").click(() => {
            $("section > #coins").append(loadGif);
            $("#searching").css("display", "block");
            $("section > #coins").show();
            $("#coins > #loading").hide();
        });

        $("section > #coins").append(loadGif);
        getData("https://api.coingecko.com/api/v3/coins/list")
            .then(coins => {
                for (let i = 2; i < 102; i++) {
                    // Information about each coin
                    const theSymbol = `<table><tr><td><span class="underline">Symbol</span>: </td><td class="capitalize">${coins[i].symbol}</td></tr>`;
                    const theName = `<tr><td><span class="underline">Name</span>: </td><td>${coins[i].name}</td></tr></table>`;
                    // Create the more info button with the collapse effect
                    const infoButton = `
                            <button class="infoButtonClass"  id="${coins[i].id}info" data-toggle="collapse" data-target=".collapse${coins[i].id}">
                                More Info
                            </button>`;
                    const infoDiv = `
                            <div class="collapse${coins[i].id}" id="${coins[i].id}Div"></div>`;
                    // Create the Toggle button
                    const toggleButton = `
                            <label class="switch">
                            <input type="checkbox" class="checkboxClass" id="switch" value="${coins[i].symbol}" >
                            <span class="slider round"></span>
                            </label>`;
                    // Input all of that into cards
                    const allDetails = `<div id="${coins[i].symbol}" class ="card">${theSymbol}${theName}${infoButton}${toggleButton}${infoDiv}</div>`;
                    $("#coins").append(allDetails);
                    // Input the correct values of every `more info` button 
                    let cardIndex = i - 1;

                    moreInfo(cardIndex, coins[i].id);
                    toggleSwitch(cardIndex, coins[i].symbol);
                }
                // Display the search button and creating his function
                $("#searching").css("display", "block");
                $("#searchField").on("keyup", function () {
                    let value = $(this).val().toLowerCase();
                    $("#coins > .card").filter(function () {
                        $(this).toggle($(this).text().indexOf(value) >= 0);
                    });

                });
                $("#loading").hide();
            })
            .catch(err => {
                alert(err.statusText);
            })

    }); // -----------------------------------------------------------------------------------------------------

    // Toggle switch function
    function toggleSwitch(index, indexInReports) {
        $(`.card:nth-of-type(${index})  .checkboxClass`).click(function () {
            // locate the index of the coin in the array
            let localIndex = reportsList.indexOf(indexInReports.toUpperCase());
            if ($(this).is(':checked')) {
                reportsList.push($(this).val().toUpperCase());
                let reportStr = JSON.stringify(reportsList);
                localStorage.setItem("reportsList", reportStr);
                // Limit to 5 checked
                if (reportsList.length > 5) {
                    $(this).prop("checked", false);
                    reportsList.splice(localIndex, 1);
                    localStorage.setItem("reportsList", JSON.stringify(reportsList));
                    // Calling the Modal functions
                    createModal();
                    $(`#myModal`).modal();
                    $(".modal-body").empty();
                    createModalBody();
                }

            }
            // Delete from array if you un-check a coin
            else {
                reportsList.splice(localIndex, 1);
                localStorage.setItem("reportsList", JSON.stringify(reportsList));
            }

        })
    }
    // Modal Functions
    function createModal() {
        const modal = `<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="modalTitle"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalTitle">You Can Choose Only 5 Coins</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary">Save changes</button>
                </div>
            </div>
        </div>
    </div>`;
        $("body").append(modal);
    }
    function createModalBody() {
        $.each(reportsList, (index, value) => {
            const p = `<div class="col-9"><p>${value}</p></div>`;
            const input = `<input type="checkbox" class="${index}" id="switch" checked>`;
            const newDiv = `<div id="${value}" class="col-12">${input}</div>`;
            $(".modal-body").append(p + newDiv);
        });
    }
    // The chosen toggle buttons //////////////////////////
    $(document).on("click", ".modal-body #switch", () => {
        // empty the array
        removeModal = [];
        for (let i = 0; i <= 4; i++) {
            // Detect the un-checked toggle buttons and add them into array
            if ($("." + i).prop("checked") == false) {
                removeModal.push(i);
            }
        }
    });
    // Modal save button ////////////////////////////////
    $(document).on("click", ".btn-primary", () => {
        $(`#myModal`).modal('hide');
        $(`input`).prop("checked", false);
        // after each item i remove from the reportsList the position of the selected coin
        // in the array will change because there is less items in that array - so, I created
        // a counter that will fix that problem.
        let counter = 0;
        for (let item of removeModal) {
            reportsList.splice(item - counter, 1);
            localStorage.setItem("reportsList", JSON.stringify(reportsList));
            counter += 1;
        }
        // mark only the the toggle buttons that remained in reportsList
        for (let item of reportsList) {
            $(`#${item.toLowerCase()} #switch`).prop("checked", true);
        }

    });
    // Function that getting data from different API's
    function getData(url) {
        return new Promise((resolve, reject) => {
            $.getJSON(url, data => {
                resolve(data);
            }).fail(err => {
                reject(err);
            });
        });
    }
    // Creating additional loading gif for `more info` and displaying it
    let loadGif2 = `<img id="loading2" src="assets/Spinner.gif">`;
    // Function for the more info button on each card
    function moreInfo(index, id) {
        $("#" + id + "info").click(() => {
            $("#" + id + "Div").append(loadGif2);
            // More info..
            getData("https://api.coingecko.com/api/v3/coins/" + id)
                .then(function(coin) {
                    const theImage = `<img class="moreInfoImg" src ="${coin.image.small}">`;
                    const eurPrice = `<p class="inlineParagraph">&nbsp<span class="underline">Price in Euro: </span><br>&nbsp${coin.market_data.current_price.eur}&#8364</p>`;
                    const usdPrice = `<p><span class="underline">Price in Dollars: </span><br>${coin.market_data.current_price.usd}$</p>`;
                    const ilsPrice = `<p><span class="underline">Price in NIS: </span><br>${coin.market_data.current_price.ils}&#8362</p>`;
                    $("#" + id + "Div").css({
                        "text-align" : "center",
                        "margin-top": "3px"
                    });
                    $("#" + id + "Div").html(`${theImage}${eurPrice}${usdPrice}${ilsPrice}`);
                    $("#loading2").hide();

                    saveToCache(id, index, coin.image.small, coin.market_data.current_price.eur, coin.market_data.current_price.usd, coin.market_data.current_price.ils);

                })
                .catch(err => { alert(err.statusText) })
        });
    }
    
    // Function that save's the `more info` data to the local storage
    function saveToCache(CacheSymbol, index, imgCoin, eurCoin, usdCoin, ilsCoin) {
        const cryptoCoin = {
            coin: CacheSymbol,
            cardIndex: index,
            img: imgCoin,
            eur: eurCoin,
            usd: usdCoin,
            ils: ilsCoin
        };
        allCoins.push(cryptoCoin);
        let coinStr = JSON.stringify(allCoins);
        localStorage.setItem("cryptoCoins", coinStr);
        // delete from local storage after 2 minutes
        setTimeout(() => {
            allCoins.splice(this, 1);
            localStorage.setItem("cryptoCoins", JSON.stringify(allCoins));
        }, 120000)

    }
})();

