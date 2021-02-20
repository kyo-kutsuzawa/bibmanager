const bibtex_parser = require("bibtex-parser");
const fs = require("fs");

const bibfilename = "library-short.bib"


window.onload = function() {
    const bibdata_raw = fs.readFileSync(bibfilename, "utf-8");
    const bibdata = parse_bib(bibdata_raw);
    const tags = get_tags(bibdata);

    write_bib(bibdata);
    write_tags(tags);
}


function parse_bib(data) {
    const bibdata = bibtex_parser(data);
    return bibdata;
}


function get_tags(bibdata) {
    let tag_list = [];
    let t = [];

    Object.keys(bibdata).forEach(function(key) {
        t = bibdata[key]["MENDELEY-TAGS"];

        if (t != undefined) {
            Array.prototype.push.apply(tag_list, t.split(","));
        }
    });

    const tags = Array.from(new Set(tag_list));
    return tags;
}


function write_bib(bibdata) {
    console.log(document);
    const listviewer = document.getElementById("biblio-table");

    let s = ""
    Object.keys(bibdata).forEach(function(key) {
        s =  "<tr>";
        s += "<td>" + bibdata[key].AUTHOR + "</td>";
        s += "<td>" + bibdata[key].TITLE + "</td>";
        s += "<td>" + bibdata[key].YEAR + "</td>";
        s += "</tr>\n";

        listviewer.innerHTML += s;
    });
}


function write_tags(tags) {
    const tagviewer = document.getElementById("tag-viewer");

    tags.forEach(tag => {
        tagviewer.innerHTML += "<div>" + tag + "</div>\n";
    });
}
