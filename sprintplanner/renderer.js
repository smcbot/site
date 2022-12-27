const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      if (registration.installing) {
        console.log("Service worker installing");
      } else if (registration.waiting) {
        console.log("Service worker installed");
      } else if (registration.active) {
        console.log("Service worker active");
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};
registerServiceWorker();


const EDIT = 0;
const VIEW = 1;
var mode = VIEW;

const SLIDER = 0;
const ASSIGNMENT = 1;
const TASK = 2;
const EMPTY = -1;

const sliderTemplate = '<div class="slider"><div class="slider-bar" id="bar"><p class="text slider-text" data-pt="16"></p></div></div>';
const sliderGoalsTemplate = '<p class="goal0 text" data-pt="12"></p>'
    +'<p class="goal1 text" data-pt="12"></p>'
    +'<p class="goal2 text" data-pt="12"></p>'
    +'<p class="goal3 text" data-pt="12"></p>'
    +'<p class="goal4 text" data-pt="12"></p>'
    +'<p class="goal5 text" data-pt="12"></p>';

const weeksDiv = '<div class="week-content" id="wc0"></div>'
    +'<div class="week-content" id="wc1"></div>'
    +'<div class="week-content" id="wc2"></div>'
    +'<div class="week-content" id="wc3"></div>'
    +'<div class="week-content" id="wc4"></div>'
    +'<div class="week-content" id="wc5"></div>';
const weeksDivScroll = '<div class="week-content scroll" id="wc0"></div>'
    +'<div class="week-content scroll" id="wc1"></div>'
    +'<div class="week-content scroll" id="wc2"></div>'
    +'<div class="week-content scroll" id="wc3"></div>'
    +'<div class="week-content scroll" id="wc4"></div>'
    +'<div class="week-content scroll" id="wc5"></div>';
const tasksTemplate = '<button class="task-button" id="task0"><span class="text button-text" data-pt="14"></span></button>'
    +'<button class="task-button" id="task1"><span class="text button-text" data-pt="14"></span></button>'
    +'<button class="task-button" id="task2"><span class="text button-text" data-pt="14"></span></button>'
    +'<button class="task-button" id="task3"><span class="text button-text" data-pt="14"></span></button>';
const assignmentTemplate = '<div class="assignment"><button class="assignment-button"></button><span class="text assignment-text" data-pt="8"></span></div>';
const assignmentEditTemplate = '<div class="assignment-edit"><button class="assignment-add"><span class="text button-text" style="color: black" data-pt="9">+</span></button><button class="assignment-remove"><span class="text button-text" style="color: black" data-pt="9">-</span></button></div>'

function getClasses(){
    return JSON.parse(localStorage.getItem("classes"));
}

function updateClasses(classes){
    localStorage.setItem("classes", JSON.stringify(classes))
}

function onEditClick() {
    var classes = getClasses();
    var button = document.querySelector("#edit");
    if (mode==VIEW) {
        mode=EDIT;
        button.style.backgroundColor = "#b7b7b7";
        button.children[0].innerText = "View";
        for (var i=0;i<5;i++) {
            var ecb = document.querySelector("#ecb"+i);
            if (classes[i][0]==EMPTY){
                ecb.style.backgroundColor = "#6aa84f";
                ecb.children[0].innerText = "+";
            } else {
                ecb.style.backgroundColor = "#e06666";
                ecb.children[0].innerText = "-";
            }
            ecb.style.visibility = "visible";
        }
        var assignEdits = document.getElementsByClassName("assignment-edit");
        for (var i=0;i<assignEdits.length;i++){
            assignEdits[i].style.visibility = "visible"
        }
    } else {
        mode=VIEW;
        button.style.backgroundColor = "#6d9eebff";
        button.children[0].innerText = "Edit";
        for (var i=0;i<5;i++) {
            var ecb = document.querySelector("#ecb"+i);
            ecb.style.visibility = "hidden";
        }
        var assignEdits = document.getElementsByClassName("assignment-edit");
        for (var i=0;i<assignEdits.length;i++){
            assignEdits[i].style.visibility = "hidden"
        }
    }
}

function onEditClassClick(button) {
    var classes = getClasses();
    var index = parseInt(button.id.charAt(3));
    if (classes[index][0]==EMPTY){
        var go = true;
        var type;
        var name;
        vex.dialog.open({
            message: 'New Class',
            input: '<label for="dropdown">How do you want to track this class?</label>'+
                '<select name="dropdown", id="dropdown">'+
                    '<option value="SLIDER">Slider (Percentage)</option>'+
                    '<option value="ASSIGNMENT">Assignments (Different Every Week)</option>'+
                    '<option value="TASK">Tasks (Same Every Week)</option>'+
                '</select>'+
                '<label for="className">What is the name of this class?</label>'+
                '<input type="text" placeholder="i.e. Math" name="className" id="className"/>',
            callback: (data) => {
                if (!data) {
                    return;
                }
                type = data.dropdown;
                name = data.className;
                if (type=="SLIDER"){
                    
                    vex.dialog.open({
                        message: 'New Class',
                        input: '<label for="start">Enter Percentage at the Beggining of the Sprint</label>'+
                            '<input type="text" name="start" id="start"/>'+
                            '<label for="end">Enter Goal Percentage for the End of the Sprint</label>'+
                            '<input type="text" name="end" id="end"/>',
                        callback: (data) => {
                            if (!data){
                                return;
                            }
                            addSliderClass(name, parseFloat(data.start), parseFloat(data.end), parseFloat(data.start), index);
                            button.style.backgroundColor = "#e06666";
                            button.children[0].innerText = "-";
                        }
                    });
                } else if (type=="ASSIGNMENT"){
                    addAssignmentClass(name, 0, 0, index);
                    button.style.backgroundColor = "#e06666";
                    button.children[0].innerText = "-";
                    var assignEdits = document.getElementsByClassName("assignment-edit");
                    for (var i=0;i<assignEdits.length;i++){
                        assignEdits[i].style.visibility = "visible"
                    }
                } else if (type=="TASK"){
                    vex.dialog.open({
                        message: 'New Class',
                        input: '<label for="task0">Task #1</label>'+
                            '<input type="text" name="task0" placeholder="i.e. Read Chapter" id="task0"/>'+
                            '<label for="task1">Task #2</label>'+
                            '<input type="text" name="task1" placeholder="(optional)" id="task1"/>'+
                            '<label for="task2">Task #3</label>'+
                            '<input type="text" name="task2" placeholder="(optional)" id="task2"/>'+
                            '<label for="task3">Task #4</label>'+
                            '<input type="text" name="task3" placeholder="(optional)" id="task3"/>',
                        callback: (data) => {
                            if (!data){
                                return;
                            }
                            addTaskClass(name, [data.task0, data.task1, data.task2, data.task3], 0, index);
                            button.style.backgroundColor = "#e06666";
                            button.children[0].innerText = "-";
                        }
                    });
                } else {
                    console.log("err" + type);
                    return;
                }
            }
        })
        
    } else {
        var go = vex.dialog.confirm({
            message: "Are you sure that you want to delete this class?",
            callback: (data) =>{
                if (!data)
                    return;
                removeClassContent(index);
                button.style.backgroundColor = "#6aa84f";
                button.children[0].innerText = "+";
            }
        });
    }
}

function sliderClick(element){
    var index = parseInt(element.id.charAt(2));
    var pc = 100*parseFloat(event.pageX-element.getBoundingClientRect().left)/element.clientWidth + element.clientWidth*0;
    sliderPercentOf100(index, pc);
}

function sliderPercent(index, percent){
    var classes = getClasses();
    var sl = document.querySelector('#cc'+index).querySelector('.slider');
    percent = Math.min(classes[index][3], percent);
    var p100 = 100*(percent-classes[index][2])/(classes[index][3]-classes[index][2]);
    sl.querySelector('.slider-bar').style.width = p100+0.5 + "%";
    sl.children[0].children[0].innerText = percent + "%";
    classes[index][4] = percent;
    updateClasses(classes);
}

function sliderPercentOf100(index, percent){
    var classes = getClasses();
	var sl = document.querySelector('#cc'+index).querySelector('.slider');
    percent = Math.min(100, percent);
	sl.querySelector('.slider-bar').style.width = percent + '%';
    var text = (((percent/100.0)*(classes[index][3]-classes[index][2]))+classes[index][2]).toFixed(1);
    if (text[text.length-1]=='0')
        text = text.substring(0, text.length-2);
	sl.children[0].children[0].innerText = text+"%";
    classes[index][4] = parseFloat(text);
    updateClasses(classes);
}

function resize() {
	var text = document.getElementsByClassName("text");
	for (var i=0;i<text.length;i++){
		var container = document.getElementById("container");
		var c = text[i];
		c.style.fontSize = (parseFloat(c.dataset.pt)*container.offsetWidth/960) + "pt";
	}
    
    for (var i=3;i<document.body.children.length;i++)
        document.body.children[i].remove();
}

function toggleButton(button) {
    if (getComputedStyle(button).backgroundColor=="rgb(183, 183, 183)"){
        button.style.backgroundColor = "#6aa84f";
    }else{        
        button.style.backgroundColor = "#b7b7b7";
    }
}

function addTaskClass(name, tasks, completed, index) {
    if (index<0||index>4)
        return;
    var classes = getClasses();
    classes[index] = [TASK, name, tasks, completed];
    if (completed===0||completed===[]||completed===null){
        classes[index] = [TASK, name, tasks, [[false, false, false, false],[false, false, false, false],[false, false, false, false],[false, false, false, false],[false, false, false, false],[false, false, false, false]]];}
    document.querySelector("#class"+index).innerText = classes[index][1];
    document.querySelector(".class-content#cc"+ index).innerHTML = weeksDiv;
    for (var i=0;i<6;i++){
        document.querySelector(".class-content#cc" + index).querySelector(".week-content#wc" + i).innerHTML = tasksTemplate;
        for (var j=0;j<4;j++){
            document.querySelector(".class-content#cc" + index).querySelector(".week-content#wc" + i).children[j].children[0].innerText = tasks[j];
            if (tasks[j]===""||tasks[j]===undefined||tasks[j]===null)
                document.querySelector(".class-content#cc" + index).querySelector(".week-content#wc" + i).children[j].style.visibility = "hidden";
            else {
                if (classes[index][3][i][j])
                    toggleButton(document.querySelector(".class-content#cc" + index).querySelector(".week-content#wc" + i).children[j]);
                document.querySelector(".class-content#cc" + index).querySelector(".week-content#wc" + i).children[j].addEventListener("click", (event) => {
                    toggleButton(event.target.parentElement);
                    classes = getClasses();
                    classes[index][3][parseInt(event.target.parentElement.parentElement.id[2])][parseInt(event.target.parentElement.id[4])] = !classes[index][3][parseInt(event.target.parentElement.parentElement.id[2])][parseInt(event.target.parentElement.id[4])];
                    updateClasses(classes);
                });
            }
        }
    }
    
    updateClasses(classes);
    resize();
}

function addAssignmentClass(name, assignments, completed, index) {
    if (index<0||index>4)
        return;
    var classes = getClasses();
    classes[index] = [ASSIGNMENT, name, assignments, completed];
    if (completed===0||completed===[]||completed===null||assignments===0||assignments===[]||assignments===null){
        classes[index] = [ASSIGNMENT, name, [[],[],[],[],[],[]], [[],[],[],[],[],[]]];}
    document.querySelector("#class"+index).innerText = classes[index][1];
    document.querySelector(".class-content#cc"+ index).innerHTML = weeksDivScroll;
    for (var i=0;i<6;i++){
        var week = document.querySelector(".class-content#cc"+ index).querySelector(".week-content#wc" + i);
        week.addEventListener("click", (event) => {
            var classes = getClasses();
            if (event.target.classList.contains("assignment-button"))
                button = event.target;
            else if (event.target.parentElement.classList.contains("assignment-add")){
                button = event.target.parentElement;
                var index = parseInt(button.parentElement.parentElement.parentElement.id[2]);
                var i = parseInt(button.parentElement.parentElement.id[2]);
                var j = classes[index][2][i].length;
                vex.dialog.open({
                    message: 'New Assignment',
                    input: '<label for="assignment">Assignment Name</label><input name="assignment" id="assignment" type="text" placeholder="i.e. Math 12.W.F"></input>',
                    callback: (data) => {
                        if (!data){
                            return
                        }
                        classes[index][2][i].push(data.assignment);
                        classes[index][3][i].push(false);
                        button.parentElement.parentElement.innerHTML += assignmentTemplate;
                        var newAssignment = document.querySelector(".class-content#cc"+index).querySelector(".week-content#wc"+i).children[document.querySelector(".class-content#cc"+index).querySelector(".week-content#wc"+i).children.length-1];
                        newAssignment.children[1].innerText = data.assignment;
                        newAssignment.id = "assignment" + j;
                        newAssignment.style.top = 5+23.4*j + "%";
                        console.log(button.parentElement)
                        document.querySelector(".class-content#cc"+index).querySelector(".week-content#wc"+i).querySelector(".assignment-edit").style.top = 5+(j+1)*23.4 + "%";
                        updateClasses(classes);
                        resize();
                    }
                });
                return;
            }else if (event.target.parentElement.classList.contains("assignment-remove")){
                button = event.target.parentElement;
                var index = parseInt(button.parentElement.parentElement.parentElement.id[2]);
                var i = parseInt(button.parentElement.parentElement.id[2]);
                var j = classes[index][2][i].length-1;
                if (j<0)
                    return
                classes[index][2][i].pop();
                classes[index][3][i].pop();
                button.parentElement.parentElement.removeChild(button.parentElement.parentElement.getElementsByClassName("assignment")[j]);
                button.parentElement.style.top = 5+j*23.4 + "%";
                updateClasses(classes);
                return;
            }else
                return
            toggleButton(button);
            classes = getClasses();
            classes[parseInt(button.parentElement.parentElement.parentElement.id[2])][3][parseInt(button.parentElement.parentElement.id[2])][parseInt(button.parentElement.id[10])] = !classes[parseInt(button.parentElement.parentElement.parentElement.id[2])][3][parseInt(button.parentElement.parentElement.id[2])][parseInt(button.parentElement.id[10])];
            updateClasses(classes);
        });
        var j;
        for (j=0;j<classes[index][2][i].length;j++){
            if (classes[index][2][i][j]!=""&&classes[index][2][i][j]!=undefined&&classes[index][2][i][j]!=null){
                week.innerHTML += assignmentTemplate;
                week.children[week.children.length-1].children[1].innerText = classes[index][2][i][j];
                if (classes[index][3][i][j])
                    toggleButton(week.children[week.children.length-1].children[0]);
                week.children[week.children.length-1].id = "assignment"+j;
                week.children[week.children.length-1].style.top = 5+23.4*j + "%";
            } else 
                break;
        }
        week.innerHTML += assignmentEditTemplate;
        week.children[week.children.length-1].style.top = 5+23.4*j + "%";
    }
    updateClasses(classes);
}

function addSliderClass(name, start, end, value, index) {
    if (index<0||index>4)
        return;
    var classes = getClasses();
    classes[index] = [SLIDER, name, start, end, value];
    document.querySelector("#class"+index).innerText = classes[index][1];
    document.querySelector("#class"+index).addEventListener("click", (event) => {
        vex.dialog.open({
            message: 'Enter Current Percentage',
            input: '<input type="text" name="number"/>',
            callback: (data) => {
                if (!data){
                    return;
                }
                sliderPercent(index, Math.round(parseFloat(data.number)*10)/10);
            }
        })
    })
    document.querySelector(".class-content#cc"+index).innerHTML = sliderGoalsTemplate;
    for (var i=0;i<6;i++) {
        document.querySelector(".class-content#cc"+index).querySelector(".goal"+i).innerText = Math.round(10*(start + (i+1)*(end-start)/6.0))/10.0+"%";
    }
    document.querySelector(".class-content#cc"+index).innerHTML += sliderTemplate;
    document.querySelector("#class"+index).className += ' pointer';
    document.querySelector(".class-content#cc"+index).querySelector(".slider").children[0].children[0].innerText = start+"%";
    document.querySelector("#cc"+index).setAttribute("onclick", "sliderClick(this)");
    updateClasses(classes);
    sliderPercent(index, value);
    resize();
}

function removeClassContent(index){
    if (index<0||index>4)
        return;
    var classes = getClasses();
    classes[index] = [EMPTY];
    document.querySelector("#class"+index).innerText = "";
    document.querySelector(".class-content#cc"+index).innerHTML = "";
    updateClasses(classes);
}

//addAssignmentClass("Test", [["Math 12.W.F", "Test2"],[],[],[],[],[]], [[true, false],[],[],[],[],[]], 2);