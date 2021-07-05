const threeCommasAPI = require('3commas-api-node')

const api = new threeCommasAPI({
  apiKey: process.env['apiKey'],
  apiSecret: process.env['apiSecret'],
  // url: 'https://api.3commas.io' // this is optional in case of defining other endpoint
})


const showActiveDeals = async (toConsole = false, shortConsole = true, nameContains) => {
  let data = await api.getDeals({
    // limit: 100,
    scope: 'active',
  })

  sorted_data = data.filter((e) => e.bot_name.includes(nameContains));
  if (toConsole) {
    if (shortConsole) {
      sorted_data.forEach(element => console.log(`${element.id} for pair ${element.pair}`));
    }
    else { console.log(sorted_data) }
  }
  return sorted_data;
}

const updateAllTakeProfit = async (tp) => {
  const deals = await showActiveDeals(false, true, '_api_');
  console.log(deals);

  for (let i = 0; i < deals.length; i++) {
    try {
      var deal_id = deals[i].id;
      var new_take_profit_percentage = tp;
      // var new_take_profit_percentage = deal.take_profit;

      let data = await api.dealUpdateTp(deal_id, new_take_profit_percentage);
      if (typeof data === undefined) {
        console.error('data is undefined');
      }
      console.log(`${data.id}: Take Profit is now ${data.take_profit}% for ${data.pair}`);
    }
    catch (error) {
      console.error(error);
      return null;
    }
  }
}

const updateTakeProfit = async (deal, tp) => {
  try {
    const deal_id = deal.id;
    const new_take_profit_percentage = tp;
    const data = await api.dealUpdateTp(deal_id, new_take_profit_percentage);
    if (typeof data === undefined) {
      console.error('data is undefined')
    }

    console.log(`${data.id}: TP changed from ${deal.take_profit} is now ${data.take_profit}% for ${data.pair}`);
    return data;
  }
  catch (error) {
    console.error(error);
    return null;
  }
}
const updateTakeProfitByID = async (id, tp) => {
  try {
    const deal_id = id;
    const new_take_profit_percentage = tp;
    const data = await api.dealUpdateTp(deal_id, new_take_profit_percentage);
    if (typeof data === undefined) {
      console.error('data is undefined')
    }
    console.log(data);
    console.log(`${data.id}: TP changed to ${data.take_profit}% for ${data.pair}`);
    return data;
  }
  catch (error) {
    console.error(error);
    return null;
  }
}

const updateDealBasedOnSO = async () => {
  const deals = await showActiveDeals(false, true, '_api_');
  console.log(`\nFound ${deals.length} deals.\n`)
  // console.log('retrieved the following deals:');
  // console.log(deals);
  const tp_array = ['0.5', '0.61', '0.74', '0.9', '3.0'];
  let deal;
  let profit_index;
  let isBusy = false;
  for (let i = 0; i < deals.length; i++) {
    try {
      deal = deals[i];

      while (isBusy) {
        let saidOnce = false;
        setTimeout(() => {
          if (!saidOnce) {
            console.log(`Deal ${deal.id} waiting in line`)
            saidOnce = true;
          }
        }, 1000);
      }
      isBusy = true;

      //check deal completed SO

      console.log(`\n${deal.id} has ${deal.completed_safety_orders_count} SO completed, and TP is ${deal.take_profit}%`);
      profit_index = deal.completed_safety_orders_count - 1;

      if (profit_index < 0) {
        console.log('...moving to next deal')
        isBusy = false;
        }

      //check if values are already equal
      else if (deal.take_profit === tp_array[profit_index]) {
        console.log(`...TP is already ${tp_array[profit_index]}%...moving to next deal`);
        isBusy = false;
        continue;
      }
      else {
        console.log(`...attempting to change to new TP: ${tp_array[profit_index]}%`)
        await updateTakeProfit(deal, tp_array[profit_index]);
        isBusy = false;
      }
    }
    catch (error) {
      isBusy = false;
      console.error(error);
    }
  }

}



const execute = async () => {
  console.log(`\n \nBeginning deal update at: ${Date.now()}`);
  await updateDealBasedOnSO();
  setTimeout(()=>{
    execute();
  },20000)
}

execute();

// updateAllTakeProfit('5.0');
//updateTakeProfitByID(568769458,'1.69');
//showActiveDeals(true);
