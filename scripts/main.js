window.onload = function() {
  // find the element that you want to drag.
  var box = document.getElementById('box');
  let element_list = document.getElementsByClassName('element');

  let dragged_item = null;
  
  /* listen to the touchMove event,
  every time it fires, grab the location
  of touch and assign it to box */
  
  /*ORIGINAL box.addEventListener('touchmove', function(e) {
    // grab the location of touch
    var touchLocation = e.targetTouches[0];
    
    // assign box new coordinates based on the touch.
    //box.style.left = touchLocation.pageX + 'px';
    box.style.top = touchLocation.pageY + 'px';
  })*/

  let touch_funct = function(e) {
    e.preventDefault();
    // grab the location of touch
    var touchLocation = e.targetTouches[0];
    var drg_box = findDraggableParent(e.target);
    dragged_item = drg_box;
    if(drg_box.draggable){
      try{
        console.log(drg_box.draggable,drg_box.className);
        console.assert(drg_box.draggable);

        let drg_box_rect = drg_box.getBoundingClientRect();
        let rect_height = drg_box_rect.bottom - drg_box_rect.top;
        let rect_width = drg_box_rect.right - drg_box_rect.left;

        box.style.display = "block";
        //box.style.left = drg_box_rect.left+'px';
        box.style.left = touchLocation.pageX - Math.floor(rect_width/2) + 'px';
        box.style.top = touchLocation.pageY - Math.floor(rect_height/2) + 'px';

        box.style.width = (drg_box_rect.right-drg_box_rect.left)*0.91 + 'px';
        box.style.height = (drg_box_rect.bottom-drg_box_rect.top)*0.9 + 'px';

        box.innerHTML = drg_box.innerHTML;

        select_item(dragged_item,true);
        check_overlap(touchLocation);
      }
      catch(e)
      {
        console.log("error: incorrect touch target",e);
      }
    }
  };


  function select_item(item,c){ // For changing the style of the selected item
    if (c){ // Style when selected
      item.style.color = "white";
      item.style.backgroundColor = "#4387e2";
    }else{ // Style when un selected
      item.style.color = "black";
      item.style.backgroundColor = "#f0f0f0";
    }
  }


  let overlapped_item = null;
  function check_overlap(touch_location){
    let element, element_rect, vertical_check, horizontal_check, new_check;
    overlapped_item = null;

    let relative_locY = touch_location.pageY - window.pageYOffset;
    let relative_locX = touch_location.pageX - window.pageXOffset;

    for (let i=0;i<element_list.length;i++){
      element = findDraggableParent(element_list[i]);
      element_rect = element.getBoundingClientRect();
      vertical_check = ((element_rect.top <= relative_locY) && (element_rect.bottom >= relative_locY));
      horizontal_check = ((element_rect.left <= relative_locX) && (element_rect.right >= relative_locX));
      new_check = (element!==dragged_item);
      if (vertical_check && horizontal_check && new_check && sameGroup(dragged_item,element)){
        overlapped_item = element;
        element.style.color = "white";
        element.style.backgroundColor = "#c0c0c0";
      }
      else if (new_check){
        element.style.color = "black";
        element.style.backgroundColor = "#f0f0f0";
      }
    }

    if (overlapped_item!==null){box.style.outline = "0.3rem solid #c0c0c0";}
    else { box.style.outline = ""; }
  }
  
  /* record the position of the touch
  when released using touchend event.
  This will be the drop position. */
  
  /* ORIGINAL box.addEventListener('touchend', function(e) {
    // current box position.
    var x = parseInt(box.style.left);
    var y = parseInt(box.style.top);
  })*/

  let touch_end = function(e) {
    // current box position.
    box.style.display = "none";
    var x = parseInt(box.style.left);
    var y = parseInt(box.style.top);
    if (overlapped_item!==null){ overlapped_item.style.backgroundColor = "#f0f0f0"; overlapped_item.style.color = "black";}
    if (dragged_item!==null){ select_item(dragged_item,false); }
    if ((overlapped_item!==null)&&(select_item!==null)){
      let auxHTML = overlapped_item.innerHTML;
      overlapped_item.innerHTML = dragged_item.innerHTML;
      dragged_item.innerHTML = auxHTML;
      
      // interchange class and id
      let auxid = overlapped_item.id; let auxclass = overlapped_item.className;
      overlapped_item.id = dragged_item.id; overlapped_item.className = dragged_item.className;
      dragged_item.id = auxid; dragged_item.className = auxclass;
    }
    box.style.outline = "";
  };

  
  for (let i=0;i<element_list.length;i++){
    element_list[i].addEventListener('touchmove',touch_funct,false);
    element_list[i].addEventListener('touchend',touch_end,false);
  }

}

function findDraggableParent(node){
  let parent = node.parentNode;
  if (node.draggable || !node.draggable) { return node; }
  else if ( parent.id === "sortably" || parent.localName==="body" ) { return null; }
  else { return findDraggableParent(parent); }
}

function sameGroup(item1,item2){
  return (item1.parentNode.id === item2.parentNode.id);
}