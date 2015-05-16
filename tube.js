var url = "http://gdata.youtube.com/feeds/api/videos/?v=2&alt=jsonc&callback=?"

// set paid-content as false to hide movie rentals
url = url + '&paid-content=false';

// set duration as long to filter partial uploads
url = url + '&duration=long';

// order search results by view count
url = url + '&orderby=viewCount';

// we can request a maximum of 50 search results in a batch
url = url + '&max-results=50%q=bill%20Hicks';
console.log(url);
