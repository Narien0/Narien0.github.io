//var myHeading = document.querySelector("h1");
//myHeading.textContent = "Hello world!";
//document.querySelector("h1").textContent = "hello there";

/*let myImage = document.querySelector("img");

myImage.onclick = () => {
  const mySrc = myImage.getAttribute("src");
  if (mySrc === "images/bear_hello.png") {
    myImage.setAttribute("src", "images/cuddly_bears.jpg");
  } else {
    myImage.setAttribute("src", "images/bear_hello.png");
  }
};*/

let added_people = [];
let added_peps_dob = [];
let storage_field_for_people = "added_people";
// RESTORE PREVIOUS LIST FROM LOCALSTORAGE
async function restore_from_localstorage(local_storage_item_label){
  let entities = get_storage_array(local_storage_item_label);
  console.log(localStorage)
  for (let i=0;i<entities.length && i < 100;i++){
    addNewPerson(entities[i],set_storg=false);
  }
}
//del_storage(storage_field_for_people);
restore_from_localstorage(storage_field_for_people);
check_deaths(added_people); // added_people is updated within addNewPerson

//addNewPerson("Q23505"); // George HW Bush for dead testing

// CHECK DEATHS
// https://query.wikidata.org/#SELECT%20%3Fentity%20%3Fdod%0AWHERE%20%7B%0A%20%20VALUES%20%3Fentity%20%7B%20wd%3AQ131385766%20wd%3AQ23505%20%7D%0A%20%20%3Fentity%20wdt%3AP570%20%3Fdod.%0A%7D
async function check_deaths(entity_list){
  if (added_peps_dob.length !== added_people.length){ // waiting till the dates of birth are added
    setTimeout(check_deaths, 10, entity_list); // https://thehotcode.com/javascript-wait-for-condition-in-function/
  }else{
    let prefixed_lists = add_wd_prefix(entity_list);
    let inc_ents = prefixed_lists.join(' ');
    let request = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=SELECT%20%3Fentity%20%3Fdod%0AWHERE%20%7B%0A%20%20VALUES%20%3Fentity%20%7B%20'+inc_ents+'%20%7D%0A%20%20%3Fentity%20wdt%3AP570%20%3Fdod.%0A%7D';
    const response = await fetch(request);
    let dobs = await response.json();
    let dob_list = dobs.results.bindings;
    
    // Mark deaths
    let ent_urll, dob_txt;
    for (let i=0;i<dob_list.length;i++){
      console.log("deaths-->",dob_list[i].dod.value,dob_list[i].entity.value.split("/")[4]);
      ent_urll = dob_list[i].entity.value.split("/");
      dob_txt = dob_list[i].dod.value;
      mark_dead(ent_urll[ent_urll.length-1],dob_txt);
    }
  }
}

function mark_dead(id,dod){
  let person_field = document.querySelector("div#pers"+id);
  // Removing alive class
  let current_values = person_field.getAttribute("class").split(" ");
  let next_values = [];
  for (let i=0;i<current_values.length;i++){
    if (current_values[i]!=="alive"){
      next_values.push(current_values[i]);
    }
  }
  next_values.push("dead");

  person_field.setAttribute("class", next_values.join(" "));
  console.log("MARKED",id,person_field);
}


// https://query.wikidata.org/#SELECT%20%3Fentity%20%3Flabel%20%3Fdob%20%3Fimg%0AWHERE%20%7B%0A%20%20VALUES%20%3Fentity%20%7B%20wd%3AQ6582186%20%7D%0A%20%20OPTIONAL%7B%3Fentity%20wdt%3AP18%20%3Fimg.%7D%0A%20%20%3Fentity%20rdfs%3Alabel%20%3Flabel.%0A%20%20OPTIONAL%7B%3Fentity%20wdt%3AP569%20%3Fdob.%7D%0A%20%20FILTER%28LANG%28%3Flabel%29%20%3D%20%22en%22%29%0A%7D
/*
SELECT ?entity ?label ?dob ?img
WHERE {
  VALUES ?entity { wd:Q6582186 }
  OPTIONAL{?entity wdt:P18 ?img.}
  ?entity rdfs:label ?label.
  OPTIONAL{?entity wdt:P569 ?dob.}
  FILTER(LANG(?label) = "en")
}
*/
async function getEntityProps(id) {
  let start = new Date();
  let request = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=SELECT%20%3Fentity%20%3Flabel%20%3Fdob%20%3Fimg%0AWHERE%20%7B%0A%20%20VALUES%20%3Fentity%20%7B%20wd%3A'+id+'%20%7D%0A%20%20OPTIONAL%7B%3Fentity%20wdt%3AP18%20%3Fimg.%7D%0A%20%20%3Fentity%20rdfs%3Alabel%20%3Flabel.%0A%20%20OPTIONAL%7B%3Fentity%20wdt%3AP569%20%3Fdob.%7D%0A%20%20FILTER%28LANG%28%3Flabel%29%20%3D%20%22en%22%29%0A%7D';
  const response = await fetch(request);
  const json = await response.json();
  console.log("getEntityProps",json);
  //console.log(request);
  let end = new Date();
  //console.log("Time elapsed Props: ", end.getTime()-start.getTime()); 

  // Clean it up into a dictionary
  let binding = json.results.bindings[0];
  //console.log(binding);
  return binding;
}

//getEntityProps("Q6101");


function getAge(date_of_birth, end_date=new Date()){ // Today by default
  let dob = date_of_birth.split('-');
  let yob = (dob[0]);
  let mob = (dob[1]);
  let dayob = (dob[2].split("T")[0]);
  let dob_f = yob+'/'+mob+'/'+dayob;
  added_peps_dob.push(dob_f);
  console.log(added_peps_dob,dob_f);

  //let today = new Date(); // https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
  let toy = String(end_date.getFullYear());
  let tom = String(end_date.getMonth()+1);
  let tod = String(end_date.getDate());
  let end_date_f = toy+'/'+tom+'/'+tod;
  
  console.log(dob_f,end_date_f);
  let d_birth = new Date(dob_f); // https://stackoverflow.com/questions/3224834/get-difference-between-2-dates-in-javascript
  let d_end = new Date(end_date_f);

  let diffmils = Math.abs(d_end - d_birth); 
  let diffdays = Math.floor(diffmils / (1000 * 60 * 60 * 24));
  let diffyears = Math.floor(diffdays / 365.25);
  let extradays = Math.floor(diffdays % 365.25);
  //console.log(diffmils,diffdays,diffyears);
  //console.log(diffyears,extradays);

  return [diffyears, extradays];
}

const placeholder_age = "No date of birth available."
function getAge_safe(d) // Which is to say taking into accout the fact that there may be no birth date available for the entity
{
  try{
    let recived_dob = d.dob.value;
    let age_quants = getAge(recived_dob);
    return age_quants[0]+" years, "+age_quants[1]+" days"
  }catch(e){
    console.log(e);
    added_peps_dob.push("0/0/0");
    return placeholder_age;
  }
}




// Use this for custom size on download https://upload.wikimedia.org/wikipedia/commons/thumb/[first_letter]/[first_two_letters]/[full_filename]/[desired_width]px-[filename]
function getSmallImageURL(full_img_url){
  let width = 120;
  let url_elems = full_img_url.split("/"); 
  let name = url_elems[url_elems.length-1];
  let clean_name = decodeURIComponent(name).replace(/ /g,"_"); // replace spaces with underscores: https://stackoverflow.com/questions/2116558/fastest-method-to-replace-all-instances-of-a-character-in-a-string
  //console.log("Names ==> ",name,clean_name);
  let hash = md5(clean_name);
  let url = "https://upload.wikimedia.org/wikipedia/commons/thumb/"+hash.substring(0,1)+"/"+hash.substring(0,2)+"/"+clean_name+"/"+String(width)+"px-"+clean_name;
  //console.log("Img url: ",url);
  return url;
}

const placeholder_img_url = "https://upload.wikimedia.org/wikipedia/commons/2/21/Imagine_necunoscuta.jpg"
function getSmURL_safe(d) // Which is to say taking into accout the fact that there may be no image for the entity
{
  try{
    let recived_url = d.img.value;
    return getSmallImageURL(recived_url);
  }catch(e){
    console.log(e);
    return placeholder_img_url;
  }
}


async function setNumber(id) {
  //let start = new Date();

  const data = await getEntityProps(id);
  //console.log("setNumber",id,data,added_people);
  let name = data.label.value;//getName(data);
  let imgurl = getSmURL_safe(data);
  let age_ammount = getAge_safe(data);
  //console.log(name,imgurl,age_ammount);

  let name_text = document.querySelector("h4#name"+id);
  let image = document.querySelector("img#img"+id);
  let age = document.querySelector("h4#age"+id);

  name_text.textContent = name;
  image.setAttribute("width","120");
  image.setAttribute("src", imgurl);
  age.textContent = age_ammount;
  //let end = new Date();
  //console.log("Time elapsed: ", end.getTime()-start.getTime());
}

///
///

let marco_polo = "Q6101";
let hard_coded_ids = ["Q207","Q48259","Q150851","Q47216","Q456921","Q449689","Q311025"];

function reset_element_ids(aglomeraiton){
  aglom = document.getElementById(aglomeraiton);
  for (let i=0;i<added_people.length;i++){
    //console.log(aglom.children[i].children[0].textContent);
    aglom.children[i].children[0].textContent = "Number "+String(i+1);    
  }
}

function removePerson(num){
  let element = document.getElementById("pers"+num);
  element.remove();
  added_people.splice(num,1);
  set_storage(storage_field_for_people,added_people);
  if (added_people.length === 0){
    del_storage(storage_field_for_people);
  }
  reset_element_ids("innerdiv");
}

///
///
///
///

// https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual/MWAPI
// https://stackoverflow.com/questions/68824808/query-wikidata-rest-api-with-related-identifier

/*
https://query.wikidata.org/#SELECT%20%3Fitem%20%3FitemLabel%20%3Fdescription%20WHERE%20%7B%0A%20%20SERVICE%20wikibase%3Amwapi%20%7B%0A%20%20%20%20%20%20bd%3AserviceParam%20wikibase%3Aendpoint%20%22www.wikidata.org%22%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20wikibase%3Aapi%20%22EntitySearch%22%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20mwapi%3Asearch%20%22jimmy%20carter%22%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20mwapi%3Alanguage%20%22en%22.%0A%20%20%20%20%20%20%3Fitem%20wikibase%3AapiOutputItem%20mwapi%3Aitem.%0A%20%20%7D%0A%20%20%3Fitem%20%28wdt%3AP279%7Cwdt%3AP31%29%20%3Ftype.%0A%20%20%3Fitem%20p%3AP31%20%3Fstatement0.%0A%20%20%3Fstatement0%20%28ps%3AP31%2F%28wdt%3AP279%2a%29%29%20wd%3AQ5.%0A%20%20FILTER%20NOT%20EXISTS%20%7B%20%3Fitem%20wdt%3AP570%20%3Fdod%20%7D%0A%20%20%0A%20%20%23FILTER%20%28%3Fitem%20%21%3D%20wd%3AQ23685%29%0A%20%20FILTER%20NOT%20EXISTS%20%7Bvalues%20%3Fitem%20%7B%20wd%3AQ23685%20wd%3AQ1267506%20wd%3AQ6199776%20%7D%7D%0A%20%20%0A%20%20%3Fitem%20rdfs%3Alabel%20%3FitemLabel.%0A%20%20%3Fitem%20schema%3Adescription%20%3Fdescription%20.%0A%20%20FILTER%28LANG%28%3FitemLabel%29%20%3D%20%22en%22%29%20%20%23%20Ensure%20English%20label%0A%20%20FILTER%28LANG%28%3Fdescription%29%20%3D%20%22en%22%29%20%20%23%20Ensure%20English%20description%0A%7D%20ORDER%20BY%20ASC%28%3Fnum%29%20LIMIT%2020
SELECT ?item ?itemLabel ?description WHERE {
  SERVICE wikibase:mwapi {
      bd:serviceParam wikibase:endpoint "www.wikidata.org";
                      wikibase:api "EntitySearch";
                      mwapi:search "jimmy carter";
                      mwapi:language "en".
      ?item wikibase:apiOutputItem mwapi:item.
  }
  ?item (wdt:P279|wdt:P31) ?type.
  ?item p:P31 ?statement0.
  ?statement0 (ps:P31/(wdt:P279*)) wd:Q5.
  FILTER NOT EXISTS { ?item wdt:P570 ?dod }
  
  FILTER NOT EXISTS {values ?item { wd:Q23685 wd:Q1267506 wd:Q6199776 }}
  
  ?item rdfs:label ?itemLabel.
  ?item schema:description ?description .
  FILTER(LANG(?itemLabel) = "en")  # Ensure English label
  FILTER(LANG(?description) = "en")  # Ensure English description
} ORDER BY ASC(?num) LIMIT 20
*/

//https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=SELECT%20DISTINCT%20%3Fx%0AWHERE%20{%0A%20%20%3Fx%20wdt%3AP214%20%22113230702%22%0A}

function add_wd_prefix(list) // adds the wd prefix to the entity codes
{
  let res = [];
  for (let i=0;i<list.length;i++){
    res.push('wd:'+list[i]);
  }
  return res;
}

async function getSearchResults(name) {
  let added_pep_codes = add_wd_prefix(added_people);
  let inc_peop = added_pep_codes.join(' ');
  if (added_pep_codes.length == 0) { inc_peop = ' ';}
  const response = await fetch('https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=SELECT%20%3Fitem%20%3FitemLabel%20%3Fdescription%20WHERE%20%7B%0A%20%20SERVICE%20wikibase%3Amwapi%20%7B%0A%20%20%20%20%20%20bd%3AserviceParam%20wikibase%3Aendpoint%20%22www.wikidata.org%22%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20wikibase%3Aapi%20%22EntitySearch%22%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20mwapi%3Asearch%20%22'+name+'%22%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20mwapi%3Alanguage%20%22en%22.%0A%20%20%20%20%20%20%3Fitem%20wikibase%3AapiOutputItem%20mwapi%3Aitem.%0A%20%20%7D%0A%20%20%3Fitem%20%28wdt%3AP279%7Cwdt%3AP31%29%20%3Ftype.%0A%20%20%3Fitem%20p%3AP31%20%3Fstatement0.%0A%20%20%3Fstatement0%20%28ps%3AP31%2F%28wdt%3AP279%2a%29%29%20wd%3AQ5.%0A%20%20FILTER%20NOT%20EXISTS%20%7B%20%3Fitem%20wdt%3AP570%20%3Fdod%20%7D%0A%20%20%0A%20%20%23FILTER%20%28%3Fitem%20%21%3D%20wd%3AQ23685%29%0A%20%20FILTER%20NOT%20EXISTS%20%7Bvalues%20%3Fitem%20%7B%20'+inc_peop+'%20%7D%7D%0A%20%20%0A%20%20%3Fitem%20rdfs%3Alabel%20%3FitemLabel.%0A%20%20%3Fitem%20schema%3Adescription%20%3Fdescription%20.%0A%20%20FILTER%28LANG%28%3FitemLabel%29%20%3D%20%22en%22%29%20%20%23%20Ensure%20English%20label%0A%20%20FILTER%28LANG%28%3Fdescription%29%20%3D%20%22en%22%29%20%20%23%20Ensure%20English%20description%0A%7D%20ORDER%20BY%20ASC%28%3Fnum%29%20LIMIT%2020');
  const json = await response.json();

  console.log(json);

  return json;
}

let result_ids = [];
function show_results(bindings){
  result_ids = [];
  let aux,des,id,label;
  for (let i=0;i<bindings.length;i++){
    des = bindings[i].description.value;
    label = bindings[i].itemLabel.value;
    split_entity_url = bindings[i].item.value.split('/'); 
    id = split_entity_url[split_entity_url.length-1];

    result_ids.push(id);
    document.getElementById("search_results").innerHTML += "<div id=result"+i+" class=result_divs onclick=selectPerson("+i+");> <h4 id=name"+i+">"+label+"</h4> <p id=des"+i+">"+des+"</p> </div>";
  }
}

async function searchPerson(){
  // clean up previous results
  document.getElementById("search_results").innerHTML = "";

  let search_term = document.getElementById("search_box").value;
  console.log("Looking up: ",search_term);
  let response = await getSearchResults(search_term);
  let results = show_results(response.results.bindings);
}
//let a = getSearchResults("jimmy carter");

function selectPerson(persons_id){
  document.getElementById("search_results").innerHTML = "";
  //console.log(persons_id,result_ids[persons_id]);
  addNewPerson(result_ids[persons_id]);
}

function addNewPerson(pep_id,set_storg=true){
  //console.log("Selected id: ",pep_id);
  added_people.push(pep_id);
  let num = String(added_people.length);
  document.getElementById("innerdiv").innerHTML += "<div id=pers"+pep_id+" class='person alive'> <div class=inline-block-child><h3>Number "+num+"</h3> <img id=img"+pep_id+" width=200></div><div class=inline-block-child><h4 id=name"+pep_id+">Name</h4> <h4 id=age"+pep_id+">Age</h4></div><div class=inline-block-child><button id=btndlt"+pep_id+" onclick=removePerson('"+pep_id+"')>Delete</button> </div></div>";
  setNumber(pep_id);
  if (set_storg) {
    set_storage(storage_field_for_people,added_people);
  }
}

///
///
///

function toggleSearchArea() {
  var x = document.getElementById("search_area");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}

//
//
//

// Trying out localstorage // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
function set_storage(field,value){ // Note that depending the datatype stored it may need to be parsed
  console.log("Storage-->",field,value);
  localStorage.setItem(field, value);
}

function del_storage(field){
  localStorage.removeItem(field);
}

function get_storage_array(field){
  try{
    //console.log("Got --> ",localStorage.getItem(field).split(','));
    return localStorage.getItem(field).split(',');
  }catch(e){
    console.log("No item found in localStorage");
    return [];
  }
}

//set_storage(f,v);
get_storage_array(storage_field_for_people);
//del_storage(f);
//get_storage_array(f);