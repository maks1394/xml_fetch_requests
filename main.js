let data = []

const tasksParent = document.getElementById('test')

class APIXML {
    getTasks(url) {
        const response = new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url)
            xhr.onload = () => {
                resolve(xhr.response)
            }
            xhr.onerror = () => reject(xhr.status)
            xhr.send()
        }).then(resp => JSON.parse(resp))
        return response
    }

    deleteTask(url, id) {
        const response = new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('DELETE', url + '/' + id)
            xhr.onload = () => {
                resolve(xhr.response)
            }
            xhr.onerror = () => reject(xhr.status)
            xhr.send()
        }).then(resp => JSON.parse(resp))
        return response
    }

    addTask(url, object) {
        const response = new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let json = JSON.stringify(object);
            xhr.open('POST', url)
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            xhr.onload = () => {
                resolve(xhr.response)
            }
            xhr.onerror = () => reject(xhr.status)
            xhr.send(json)
        }).then(resp => JSON.parse(resp))
        return response
    }

    updateTask(url, object, taskID) {
        const response = new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let json = JSON.stringify(object);
            xhr.open('PATCH', url + '/' + taskID)
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            xhr.onload = () => {
                resolve(xhr.response)
            }
            xhr.onerror = () => reject(xhr.status)
            xhr.send(json)
        }).then(resp => JSON.parse(resp))
        return response
    }
}

class APIFetch {
    getTasks(url) {
        return fetch(url, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            }
        }).then(async function (response) {
            const data = await response.json();
            return data;
        })
    }

    deleteTask(url, id) {
        return fetch(url + '/' + id, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(async function (response) {
            const data = await response.json();
            return data;
        })
    }

    addTask(url, object) {
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(object),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(async function (response) {
            const data = await response.json();
            return data;
        })
    }

    updateTask(url, object, taskID) {
        return fetch(url + '/' + taskID, {
            method: 'PATCH',
            body: JSON.stringify(object),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(async function (response) {
            const data = await response.json();
            return data;
        })
    }
}

let API = new APIFetch()

const createMappedElements = (data) => {
    return data.map(el => {
        const HTMLElement = document.createElement('div')
        HTMLElement.style = 'border:1px solid black;'
        HTMLElement.setAttribute('id', `${el.id}`)
        const inputEl = document.createElement('input')
        inputEl.setAttribute('type', 'checkbox')
        inputEl.checked = el.isCompleted
        HTMLElement.appendChild(inputEl)
        inputEl.addEventListener('change', onChangeCheckBoxFunctionCreator(inputEl, el))
        const newContent = document.createElement('span');
        const title = document.createTextNode('Title: ')
        newContent.innerHTML = `${el.name}`
        HTMLElement.appendChild(title)
        HTMLElement.appendChild(newContent)
        if (el.isCompleted) {
            newContent.style = 'text-decoration: line-through;'
        }
        newContent.addEventListener("dblclick", replaceFunctionCreator(newContent, HTMLElement, el));
        const newContentInfo = document.createElement('span');
        const info = document.createTextNode(' Info: ')
        newContentInfo.innerHTML = `${el.info}`
        HTMLElement.appendChild(info)
        newContentInfo.addEventListener("dblclick", replaceFunctionCreator(newContentInfo, HTMLElement, el, 'info'));
        HTMLElement.appendChild(newContentInfo)
        const inputElImportant = document.createElement('input')
        inputElImportant.setAttribute('type', 'checkbox')
        inputElImportant.checked = el.isImportant
        const isImportantText = document.createTextNode(' isImportant: ')
        HTMLElement.appendChild(isImportantText)
        HTMLElement.appendChild(inputElImportant)
        const buttonElDelete = document.createElement('button')
        buttonElDelete.innerHTML = 'x'
        buttonElDelete.addEventListener('click', deleteTaskFunctionCreator(buttonElDelete, el))
        HTMLElement.appendChild(buttonElDelete)
        inputElImportant.addEventListener('change', onChangeCheckBoxFunctionCreator(inputElImportant, el, "isImportant"))
        return HTMLElement
    })
}

const deleteTaskFunctionCreator = (buttonElDelete, elementFromMap) => {
    return (e) => {
        buttonElDelete.disabled = true
        API.deleteTask('https://intership-liga.ru/tasks', elementFromMap.id).then(() => {
            data = data.filter(el => el.id !== elementFromMap.id)
            setAndRerenderTasks(data)
        }).catch(err => {
            console.log(err)
        })
    }
}

const replaceFunctionCreator = (newContentNode, ParentNode, elementFromMap, property = 'name') => {
    return function replace(e) {
        const textInputEl = document.createElement('input')
        textInputEl.value = elementFromMap[property]
        const buttonEl = document.createElement('button')
        buttonEl.innerHTML = 'save'
        newContentNode.replaceWith(textInputEl)
        ParentNode.appendChild(buttonEl)
        buttonEl.addEventListener('click', updateTaskFunctionCreator(buttonEl, elementFromMap, textInputEl, property))
    }
}

const updateTaskFunctionCreator = (buttonEl, elementFromMap, textInputEl, property) => {
    return (e) => {
        buttonEl.disabled = true
        const request = {[property]: textInputEl.value}
        update(request, elementFromMap)
    }
}

function onChangeCheckBoxFunctionCreator(checkBoxElem, elementFromMap, property = 'isCompleted') {
    return function (event) {
        checkBoxElem.disabled = true
        const request = {[property]: checkBoxElem.checked}
        update(request, elementFromMap)
    }
}

function update(request, elementFromMap) {
    API.updateTask('https://intership-liga.ru/tasks', request, elementFromMap.id).then(resp => {
        const updatedTask = resp
        data = data.map(el => el.id === updatedTask.id ? updatedTask : el)
        setAndRerenderTasks(data)
    }).catch(err => {
        console.log(err)
    })
}

function setAndRerenderTasks(newData) {
    tasksParent.innerHTML = ''
    const elements = createMappedElements(newData)
    elements.forEach((htmlEl) => {
        tasksParent.appendChild(htmlEl)
    })
}

function createAddTaskElement() {
    const addTaskElement = document.createElement('div')
    const nameText = document.createTextNode('Name: ')
    const nameInput = document.createElement('input')
    const infoText = document.createTextNode(' Info: ')
    const infoInput = document.createElement('input')
    const isImportantText = document.createTextNode(' is important: ')
    const isImportantInput = document.createElement('input')
    isImportantInput.setAttribute('type', 'checkbox')
    const addTaskButton = document.createElement('button')
    addTaskButton.innerHTML = 'add task'
    addTaskElement.appendChild(nameText)
    addTaskElement.appendChild(nameInput)
    addTaskElement.appendChild(infoText)
    addTaskElement.appendChild(infoInput)
    addTaskElement.appendChild(isImportantText)
    addTaskElement.appendChild(isImportantInput)
    addTaskElement.appendChild(addTaskButton)
    addTaskButton.addEventListener('click', addTaskFunctionCreator(addTaskButton, nameInput, infoInput, isImportantInput))
    return addTaskElement
}

function addTaskFunctionCreator(addTaskButton, nameInput, infoInput, isImportantInput) {
    return (e) => {
        const request = {
            "name": nameInput.value,
            "info": infoInput.value,
            "isImportant": isImportantInput.checked,
        }
        addTaskButton.disabled = true
        API.addTask('https://intership-liga.ru/tasks', request).then(resp => {
            const newTask = resp
            data = [...data, newTask]
            setAndRerenderTasks(data)
            nameInput.value = ''
            infoInput.value = ''
            isImportantInput.checked = false
        }).catch(err => {
            console.log(err)
        }).finally(() => {
            addTaskButton.disabled = false
        })
    }
}


document.body.insertBefore(createAddTaskElement(), tasksParent);


const getAndSetTasks = () => {
    tasksParent.innerHTML = 'loading'
    API.getTasks('https://intership-liga.ru/tasks').then((resp) => {
        const tasks = resp
        data = [...tasks]
        setAndRerenderTasks(tasks)
    }).catch(err => {
        console.log(err)
    })
}
getAndSetTasks()
