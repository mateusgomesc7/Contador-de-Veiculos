let mudanca = false;
function myFunction() {
  document.querySelector('.sidenav .container').classList.toggle("change");
  if (!mudanca) {
    document.getElementById("mySidenav").style.width = "250px";
    mudanca = true;
  } else {
    document.getElementById("mySidenav").style.width = "0";
    mudanca = false;
  }
}

function openNav() {
  document.getElementById("myNav").style.height = "100%";
}
function closeNav() {
  document.getElementById("myNav").style.height = "0%";
}

// Add active class to the current button (highlight it)
var header = document.getElementById("myDIV");
var btns = header.getElementsByClassName("btn");
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function () {
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
  });
}

function trocaClasse(elemento, antiga, nova) {
  elemento.classList.remove(antiga);
  elemento.classList.add(nova);
}

function abrirVideo() {
  var titulo = document.querySelector('.noCentro');
  trocaClasse(titulo, 'noCentro', 'emCima');
}

function fecharVideo() {
  var titulo = document.querySelector('.emCima');
  trocaClasse(titulo, 'emCima', 'noCentro');
}


//Make the DIV element draggagle:
dragElement(document.getElementById("mydiv"));

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id)) {
    /* if present, the header is where you move the DIV from:*/
    document.getElementById(elmnt.id).onmousedown = dragMouseDown;
  } else {
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}