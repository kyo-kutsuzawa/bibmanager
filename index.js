'use strict';

var bibtex_parser = require("bibtex-parser");
const fs = require("fs");

//const bibfilename = "library-full.bib"
const bibfilename = "library-mid.bib"


function load_bib() {
    fs.readFile(bibfilename, "utf-8", (err, data) => {
        if (err) throw err;
        const bibdata = parse_bib(data);
        write_bib(bibdata);
    });
}


function parse_bib(data) {
    console.log("Load bib data");
    const bibdata = bibtex_parser(data);
    console.log(bibdata);

    //console.log(bibdata.FUJIMOTO2000);
    //console.log(bibdata.FUJIMOTO2000.entryType);

    return bibdata;
}


function write_bib(bibdata) {
    let a = document.getElementById("biblist");

    let s = ""
    Object.keys(bibdata).forEach(function(key) {
        s =  "<li>";
        s += bibdata[key].AUTHOR + "; ";
        s += "\"" + bibdata[key].TITLE + "\"";
        s += ", " + bibdata[key].YEAR + ".";
        s += "</li>";
        a.innerHTML += s;
    });
}

load_bib();
