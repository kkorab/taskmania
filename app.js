// vars
const hero = document.querySelector('.hero');
const navBtns = document.querySelectorAll('.menu__link');
const menuItems = document.querySelectorAll('.menu__item');
const slides = document.querySelectorAll('.slide');
const timesUser = document.querySelector('.user-header__times');
const addTaskBtn = document.querySelector('.add-task-btn');
const closeFormNewTask = document.querySelector('.add-task-times');
const addCategoryForm = document.querySelector('.add-category-cnt');
const pageTitles = document.querySelectorAll('.page-title');
const addTaskForm = document.getElementById('addTaskForm');
const tasksContainer = document.querySelector('.tasks-container')
const alert = document.querySelector('.alert');
const alertCnt = document.querySelector('.alert-cnt');
const categoriesList = document.querySelector('.categories');
const selectHistoryCategory = document.getElementById('history-select-category');

const categories = JSON.parse(localStorage.getItem('categories'))|| ['all'];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let thisDay = [];
let thisWeek = [];
let thisMonth = [];
let otherDate = [];
let historyTasks = [];

// EVENTS
window.addEventListener('load', intro);
menuItems.forEach(menuItem => menuItem.addEventListener('click', setActive));
navBtns.forEach(navBtn => navBtn.addEventListener('click', navTo));
timesUser.addEventListener('click', closeThis);
addTaskBtn.addEventListener('click', showTaskForm);
closeFormNewTask.addEventListener('click', closeThis);
addCategoryForm.addEventListener('submit', addCategory);
addTaskForm.addEventListener('submit', addTask);
categoriesList.addEventListener('click', deleteCategory);
tasksContainer.addEventListener('click', deleteTask);
selectHistoryCategory.addEventListener('change', displayHistoryTasks);

window.addEventListener('DOMContentLoaded', () => {
    updateCategories();
    displayCategories();
    displayHistoryTasks();
    filterByDate();
    updateTaskCnt();
    displayUserTasks();
    setDateOnLoad();
    setTimeOnLoad();
});

// FUNCTIONS

//intro

function intro() {
    setTimeout(() => {
        hero.style.animation = "opacity 2s forwards";
    }, 3000)
    setTimeout(() => {
        hero.style.display = 'none';
    }, 4500)
};

// nav functions

function setActive(e) {
    const href = e.currentTarget.querySelector('.menu__link').getAttribute('href').slice(1);
    if(href.length == 0) {
        return;
    }
    else {
        menuItems.forEach(menuItem => menuItem.classList.remove('active'));
        e.currentTarget.classList.add('active');
    }
};

function navTo(e) {
    //removing fixed class to all items
    e.preventDefault();
    const id = e.currentTarget.getAttribute('href').slice(1);
    if (id.length == 0) {
        document.body.classList.add('show-user');
    }
    else {
    slides.forEach(slide => slide.classList.remove('fixed'));
    pageTitles.forEach(title => title.classList.remove('fixed-page-title'));
    const slide = document.getElementById(id);
    slide.children[0].classList.add('fixed-page-title');
    // making slide 100% width
    slide.classList.add('fixed');
    const x = slide.getBoundingClientRect().left;
    const contentSlider = document.querySelector('.content-slider');
    contentSlider.scrollTo(x, 0);
    }
};

function closeThis() {
    document.body.classList = "";
};

// categories functions


function addCategory(e) {
    e.preventDefault();
    const addCategoryInput = document.querySelector('.add-category');
    if (addCategoryInput.value == "") {
        return displayAlert('Please enter category name', 'fail');
    }
    else if (categories.indexOf(addCategoryInput.value.toLowerCase()) !== -1) {
        return displayAlert('Please enter another category name', 'fail');
    }
    else {
        categories.push((addCategoryInput.value).toString().toLowerCase());
        updateCategories();
        displayAlert('category has been added', 'success');
        displayCategories();
        updateLocalStorage()
    }
    addCategoryForm.reset();
};

function displayCategories() {
    if (categories.length) {
        let text = '';
        categories.forEach(category => {
            text += `
            <div class="new-category">
                <h2 class="new-category-name">${category}</h2>
                <i class="fas fa-minus-circle"></i>
            </div>`
        })
        categoriesList.innerHTML = text;
    }
    else {
        categoriesList.innerHTML = `<h2 class="no-categories"> Add your category </h2>`
    }
};

function updateCategories() {
    const selectInputs = document.querySelectorAll('.select-category');
    selectInputs.forEach(selectInput => {
        let text = '';
        categories.forEach(category => {
            text += `<option value="${category}">${category}</option>`
            selectInput.innerHTML = text;
        });
    });
};

function deleteCategory(e) {
    if (e.target.classList.contains('fa-minus-circle')) {
        const categoryName = e.target.previousElementSibling.textContent;
        const index = categories.findIndex(category => category == categoryName);
        tasks = tasks.filter(task => task.category !== categoryName);
        e.target.closest('.new-category').remove();
        categories.splice(index,1);
        updateCategories();
        displayCategories();
        filterByDate();
        updateTaskCnt();
        displayUserTasks();
        updateLocalStorage()
    }
    else {
        return;
    }
};


// tasks functions 
function addTask(e) {
    e.preventDefault();
    const newTaskInput = document.querySelector('.newTask');
    const newTaskDate = document.querySelector('.newTaskDate');
    const newTaskTime = document.querySelector('.newTaskTime');
    const selectedCategory = document.querySelector('.addTaskSelect');
    const randomID = new Date().getMilliseconds();
    const task = {
        id: randomID,
        value: newTaskInput.value,
        date: newTaskDate.value,
        time: newTaskTime.value,
        category: selectedCategory.value
    };
    tasks.push(task);
    addTaskForm.reset();
    displayAlert('task has been added', 'success');
    filterByDate();
    updateTaskCnt();
    displayUserTasks();
    updateLocalStorage();
};

function deleteTask(e) {
    if (e.target.classList.contains('fa-minus-circle')) {
        const targetValue = e.target.closest('.task').children[0].children[0].children[1].textContent;
        const index = tasks.findIndex(task => task.value == targetValue);
        tasks.splice(index,1)
        e.target.closest('.task').remove();
        filterByDate();
        updateTaskCnt();
        displayUserTasks();
        updateLocalStorage();
    }
    else {
        return;
    }
};

function showTaskForm() {
    document.body.classList.add('show-task');
};

function filterByDate() {
    const now = new Date();
    // if the task is the same day
    thisDay = tasks.filter(task => {
        const taskDate = new Date(`${task.date}T${task.time}:00`);
        return (now.getDate() == taskDate.getDate() && now.getMonth() == taskDate.getMonth() && now.getFullYear() == taskDate.getFullYear());
    })
    // if the task is the same week
    thisWeek = tasks.filter(task => {
        const taskDate = new Date(`${task.date}T${task.time}:00`);
        return (now.getWeek() == taskDate.getWeek() && now.getFullYear() == taskDate.getFullYear() && now.getDate() !== taskDate.getDate() );
    })
    // and so on..
    thisMonth = tasks.filter(task => {
        const taskDate = new Date(`${task.date}T${task.time}:00`);
        return (now.getMonth() == taskDate.getMonth() && now.getFullYear() == taskDate.getFullYear() && now.getDate() !== taskDate.getDate() && now.getWeek() !== taskDate.getWeek());
    })

    otherDate = tasks.filter(task => {
        const taskDate = new Date(`${task.date}T${task.time}:00`);
        return (now.getMonth() !== taskDate.getMonth());
    })
    // now.getDate() !== taskDate.getDate() && now.getWeek() !== taskDate.getWeek()
}

function updateTaskCnt() {
    tasksContainer.innerHTML = '';
    if (thisDay.length) {
        const taskGroup = document.createElement('div');
        const taskGroupTitle = document.createElement('h2');
        taskGroup.classList.add('task-group');
        taskGroupTitle.classList.add('task-group-title');
        taskGroupTitle.textContent = "This day";
        tasksContainer.appendChild(taskGroup);
        taskGroup.appendChild(taskGroupTitle);
        thisDay.forEach(task => {
            const newTask = document.createElement('div');
            newTask.classList.add('task');
            newTask.innerHTML = `
            <div class="task-main">
                <div class="task-left">
                    <input class="task-checkbox" type="checkbox">
                    <p class="task-content">${task.value}</p>
                </div>
                <div class="task-right">
                    <i class="fas fa-minus-circle"></i>
                </div>
            </div>
            <div class="task-info">${task.category}-${task.date} ${task.time}</div>`
            taskGroup.appendChild(newTask);
        })
    }
    if (thisWeek.length) {
        const taskGroup = document.createElement('div');
        const taskGroupTitle = document.createElement('h2');
        taskGroup.classList.add('task-group');
        taskGroupTitle.classList.add('task-group-title');
        taskGroupTitle.textContent = "This week";
        tasksContainer.appendChild(taskGroup);
        taskGroup.appendChild(taskGroupTitle);
        thisWeek.forEach(task => {
            const newTask = document.createElement('div');
            newTask.classList.add('task');
            newTask.innerHTML = `
            <div class="task-main">
                <div class="task-left">
                    <input class="task-checkbox" type="checkbox">
                    <p class="task-content">${task.value}</p>
                </div>
                <div class="task-right">
                    <i class="fas fa-minus-circle"></i>
                </div>
            </div>
            <div class="task-info">${task.category}-${task.date} ${task.time}</div>`
            taskGroup.appendChild(newTask);
        })
    }

    if (thisMonth.length) {
        const taskGroup = document.createElement('div');
        const taskGroupTitle = document.createElement('h2');
        taskGroup.classList.add('task-group');
        taskGroupTitle.classList.add('task-group-title');
        taskGroupTitle.textContent = "This month";
        tasksContainer.appendChild(taskGroup);
        taskGroup.appendChild(taskGroupTitle);
        thisMonth.forEach(task => {
            const newTask = document.createElement('div');
            newTask.classList.add('task');
            newTask.innerHTML = `
            <div class="task-main">
                <div class="task-left">
                    <input class="task-checkbox" type="checkbox">
                    <p class="task-content">${task.value}</p>
                </div>
                <div class="task-right">
                    <i class="fas fa-minus-circle"></i>
                </div>
            </div>
            <div class="task-info">${task.category}-${task.date} ${task.time}</div>`
            taskGroup.appendChild(newTask);
        })
    }

    if (otherDate.length) {
        const taskGroup = document.createElement('div');
        const taskGroupTitle = document.createElement('h2');
        taskGroup.classList.add('task-group');
        taskGroupTitle.classList.add('task-group-title');
        taskGroupTitle.textContent = "Other";
        tasksContainer.appendChild(taskGroup);
        taskGroup.appendChild(taskGroupTitle);
        otherDate.forEach(task => {
            const newTask = document.createElement('div');
            newTask.classList.add('task');
            newTask.innerHTML = `
            <div class="task-main">
                <div class="task-left">
                    <input class="task-checkbox" type="checkbox">
                    <p class="task-content">${task.value}</p>
                </div>
                <div class="task-right">
                    <i class="fas fa-minus-circle"></i>
                </div>
            </div>
            <div class="task-info">${task.category}-${task.date} ${task.time}</div>`
            taskGroup.appendChild(newTask);
        })
    }

    if (!tasks.length) {
        tasksContainer.innerHTML = `
            <div class="empty-tasks-cnt">
                <h2 class="empty-task-cnt-info">Add your tasks...</h2>
            </div>
        `
    }
};

//history functions 

function moveToHistory() {
    const now = new Date();
    historyTasks = tasks.filter(task => {
        return (new Date(`${task.date}T${task.time}:00`) < now) 
    })
    return historyTasks;
}

function displayHistoryTasks() {
    let text = '';
    const selectedCategory = document.getElementById('history-select-category');
    const value = selectedCategory.value;
    if (value == "all") {
        const tasksByCategory = historyTasks;
        tasksByCategory.forEach(task => {
            text += `
            <div class="previous-task">
                <div class="task-main">
                    <div class="task-left">
                        <input class="task-checkbox" type="checkbox">
                        <p class="previous-task-content">${task.value}</p>
                    </div>
                    <div class="task-right">
                        <i class="fas fa-minus-circle previous-minus-circle"></i>
                    </div>
                </div>
                <div class="previous-task-info">${task.category}-${task.date} ${task.time}</div>
            </div>`
        })
    }
    else {
        const tasksByCategory = historyTasks.filter(task => task.category == value);
        tasksByCategory.forEach(task => {
        text += `
        <div class="previous-task">
            <div class="task-main">
                <div class="task-left">
                    <input class="task-checkbox" type="checkbox">
                    <p class="previous-task-content">${task.value}</p>
                </div>
                <div class="task-right">
                    <i class="fas fa-minus-circle previous-minus-circle"></i>
                </div>
            </div>
            <div class="previous-task-info">${task.category}-${task.date} ${task.time}</div>
        </div>`
    })
    }
    const previousTasks = document.querySelector('.previous-tasks');
    previousTasks.innerHTML = text;
}

// adding expired tasks every 1 one minute to history
window.setInterval(moveToHistory, 60000);
window.setInterval(displayHistoryTasks, 60000);


// user functions

function displayUserTasks() {
    const userTasksCnt = document.querySelector('.user-tasks-group');
    userTasksCnt.innerHTML = '<h4 class="more-user-tasks">User tasks:</h4>';
    if (thisDay.length) {
        const userTask = document.createElement('div');
        const counter = thisDay.length;
        userTask.classList.add('user-task');
        userTask.innerHTML = `
            <div class="user-task-counter">${counter}</div>
            <div class="user-task-title">This day</div>`
        userTasksCnt.appendChild(userTask);
    }
    if (thisWeek.length) {
        const userTask = document.createElement('div');
        const counter = thisWeek.length;
        userTask.classList.add('user-task');
        userTask.innerHTML = `
            <div class="user-task-counter">${counter}</div>
            <div class="user-task-title">This week</div>`
        userTasksCnt.appendChild(userTask);
    }
    if (thisMonth.length) {
        const userTask = document.createElement('div');
        const counter = thisMonth.length;
        userTask.classList.add('user-task');
        userTask.innerHTML = `
            <div class="user-task-counter">${counter}</div>
            <div class="user-task-title">This month</div>`
        userTasksCnt.appendChild(userTask);
    }
    categories.forEach(category => {
        const userTask = document.createElement('div');
        const counter = tasks.filter(task => task.category == category).length;
        userTask.classList.add('user-task');
        userTask.innerHTML = `
            <div class="user-task-counter">${counter}</div>
            <div class="user-task-title">${category}</div>`
        userTasksCnt.appendChild(userTask);
    })
}

// display alert

function displayAlert(text, action) {
    alert.textContent = text;
    alertCnt.classList.add(`alert-cnt-${action}`);
    // remove alert
    setTimeout(function () {
      alert.textContent = "";
      alertCnt.classList.remove(`alert-cnt-${action}`);
    }, 5000);
};

// scroll reveal

ScrollReveal().reveal('.reveal')


// add task form functions

function fixDateAndTime(value) {
    if (value <10) {
        return `0${value}`
    }
    else {
        return `${value}`
    }
}

function setDateOnLoad() {
    const now = new Date();
    const year = now.getFullYear();
    const date = now.getDate();
    const month = now.getMonth()+1 ;

    const setDate = document.querySelector('.newTaskDate');
    setDate.setAttribute('value', `${year}-${fixDateAndTime(month)}-${fixDateAndTime(date)}`);
    setDate.setAttribute('min', `${year}-${fixDateAndTime(month)}-${fixDateAndTime(date)}`);

}

function setTimeOnLoad() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    const newTaskTime = document.querySelector('.newTaskTime');
    newTaskTime.setAttribute('value', `${fixDateAndTime(hour)}:${fixDateAndTime(minute)}`)
}

// local storage

function updateLocalStorage() {
    const myTasks = JSON.stringify(tasks);
    localStorage.setItem('tasks', myTasks);
    const myCategories = JSON.stringify(categories);
    localStorage.setItem('categories', myCategories);
}

//get week of the year

Date.prototype.getWeek = function() {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                          - 3 + (week1.getDay() + 6) % 7) / 7);
}
  
// Returns the four-digit year corresponding to the ISO week of the date.
Date.prototype.getWeekYear = function() {
    var date = new Date(this.getTime());
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    return date.getFullYear();
}