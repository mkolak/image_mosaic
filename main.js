let cache = {}
/* 
    Get base log is used in update grid as an auxillary function.
    Update grid is called whenever the number of elements in a container changes(ADD/REMOVE).
    It does calculations to deterimine grid composition
*/

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}

function updateGrid(n) {
    if (n == 0) return;
    let col_num = 1;
    while (getBaseLog(col_num, n) > 2) {
        col_num *= 2
    }
    let row_num = n % col_num != 0 ? (n / col_num) >> 0 : col_num;
    let double_cols = n % col_num != 0 ? col_num - n % col_num : 0;
    let container = document.querySelector('.container');
    container.style.gridTemplateColumns = `repeat(${col_num}, 1fr)`
    for (let i = 0; i < col_num * 2; i++) {
        if (i < double_cols) {
            container.children[i].classList.add('h-2')
        } else {
            container.children[i].classList.remove('h-2')
        }
    }

}

/* 
    Create slide makes an HTML element. It attaches classes and events to child nodes. 
    It is triggered whenever a query is entered in a main input bar.
*/

function createSlider(urls, clean_id, cacheNumber = 0) {
    let id;
    let container = document.querySelector('.container');
    if (cacheNumber) {
        id = 'a-' + cacheNumber + '-' + clean_id.split(' ').join('-');
    } else {
        id = 'a-' + clean_id.split(' ').join('-');
    }
    let slider = document.createElement('div');
    slider.classList.add('slider');
    slider.id = id + '-slider';
    for (let i = 0; i < urls.length; i++) {
        let slide = createSlide(id, urls[i]);
        slider.appendChild(slide)
    }
    slider.children[0].classList.add('current');
    let buttons = createButtons(id);
    let label = createLabel(id, clean_id);
    slider.appendChild(buttons);
    slider.appendChild(label);
    addSliderEvents(slider);
    container.appendChild(slider);
    let n = container.children.length;
    slider.classList.toggle('small', n > 12 && n <= 32);
    slider.classList.toggle('very-small', n > 32);
}

function createSlide(id, url) {
    let slide = document.createElement('div');
    slide.classList.add('slide', id + '-slide');
    slide.style.background = `url(${url}) no-repeat 50% 50%/cover`;
    return slide;
}

// Each slider has 3 buttons. Two are for changing images, one is for removal of slider

function createButtons(id) {
    let buttons = document.createElement('div');
    buttons.classList.add('buttons');
    buttons.id = id;
    let prev = document.createElement('button');
    prev.classList.add('prev');
    let next = document.createElement('button');
    next.classList.add('next');
    let prevIcon = document.createElement('i');
    prevIcon.classList.add('fas', 'fa-arrow-left');
    let nextIcon = document.createElement('i');
    nextIcon.classList.add('fas', 'fa-arrow-right');
    prev.appendChild(prevIcon);
    prev.addEventListener('click', prevSlide);
    next.appendChild(nextIcon);
    next.addEventListener('click', nextSlide);
    let remove = document.createElement('button');
    remove.classList.add('remove');
    let removeIcon = document.createElement('i');
    removeIcon.classList.add('fas', 'fa-times');
    remove.appendChild(removeIcon);
    remove.addEventListener('click', removeSlide);
    buttons.appendChild(prev);
    buttons.appendChild(next);
    buttons.appendChild(remove);
    return buttons;
}

function nextSlide(e) {
    let buttonID;
    if (e.target.tagName == 'I') {
        buttonID = e.target.parentElement.parentElement.id;
    } else {
        buttonID = e.target.parentElement.id;
    }
    const current = document.querySelector('.' + buttonID + '-slide.current');
    current.classList.remove('current');
    if (!current.nextElementSibling.classList.contains('buttons')) {
        current.nextElementSibling.classList.add('current');
    } else {
        current.parentElement.firstElementChild.classList.add('current');
    }
};

function prevSlide(e) {
    let buttonID;
    if (e.target.tagName == 'I') {
        buttonID = e.target.parentElement.parentElement.id;
    } else {
        buttonID = e.target.parentElement.id;
    }
    const current = document.querySelector('.' + buttonID + '-slide.current');
    current.classList.remove('current');
    if (current.previousElementSibling) {
        current.previousElementSibling.classList.add('current');
    } else {
        current.parentElement.children[2].classList.add('current');
    }
};

function removeSlide(e) {
    let buttonID;
    if (e.target.tagName == 'I') {
        buttonID = e.target.parentElement.parentElement.id;
    } else {
        buttonID = e.target.parentElement.id;
    }
    document.querySelector(`#${buttonID}-slider`).remove();
    let n = document.querySelector('.container').children.length;
    updateGrid(n);
    if (n == 12 || n == 32) {
        upSizeButtons(n);
    }

}

//    Label element serves first as image label, and second as a text input which can be used to update images in the chosen slider

function createLabel(id, text) {
    let label = document.createElement('input');
    label.classList.add('label');
    label.id = id + '-label';
    label.type = 'text';
    label.value = text;
    addLabelEvents(label);
    return label;
}

//  Event listeners for each label.

let label_txt; // Global variable which is used to determine whether a text within some label should be changed, or reset to default depending on event triggered

function addLabelEvents(label) {
    label.addEventListener('mouseover', (e) => {
        mousedown = false;
        label_txt = label.value;
    });
    label.addEventListener('mouseout', (e) => {
        label.blur();
        label.value = label_txt;
    });

    //  Keyup event is used to trigger an slider update when user types a new value into label/input and presses enter.

    label.addEventListener('keyup', (e) => {
        if (e.keyCode === 13) {
            let clean_id = label.value;
            let current_id = label.id.slice(0, -6);
            label_txt = label.value;
            label.blur();
            if (cache[clean_id]) {
                cache[clean_id][0]++;
                updateSlide(cache[clean_id][1], clean_id, current_id, cache[clean_id][0]);
                return;
            }
            let query = clean_id.split(' ').join('+');
            fetch('fetch_images.py', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    body: query
                })
                .then(response => response.json())
                .then(result => {
                    cache[clean_id] = [1, Object.values(result)];
                    updateSlide(Object.values(result), clean_id, current_id);
                });
        }
    });
}

function updateSlide(urls, clean_id, previous_id, cacheNumber = 0) {
    let slider = document.querySelector('#' + previous_id + '-slider');
    let new_id;
    if (cacheNumber) {
        new_id = 'a-' + cacheNumber + '-' + clean_id.split(' ').join('-');
    } else {
        new_id = 'a-' + clean_id.split(' ').join('-');
    }
    slider.id = new_id + '-slider';
    for (let i = 0; i < urls.length; i++) {
        slider.children[i].style.background = `url(${urls[i]}) no-repeat 50% 50%/cover`;
        slider.children[i].classList.replace(previous_id + '-slide', new_id + '-slide');
    }
    slider.lastElementChild.previousElementSibling.id = new_id;
    slider.lastElementChild.id = new_id + '-label';
    slider.lastElementChild.value = clean_id;
}

//   Event listener for a slider. They serve the function of making the image within slider 'draggable' so that its position can be changed depending on set of events triggered

let current_slide; // Global variable used to deterimine which slider is currently active

let mousedown = false; // Global variable used to determine whether mouse has initiated an 'drag' event

function addSliderEvents(slider) {

    // First function serves as a initiator of drag event. All parameters are set upon a mousedown event, and user is ready to move image with mousemove event

    slider.addEventListener('mousedown', (e) => {
        if (!e.target.classList.contains('slide')) {
            return;
        }
        mousedown = true;
        for (let slide of slider.children) {
            if (slide.classList.contains('current')) {
                current_slide = slide;
            }
        }
        current_slide.style.zIndex = '10';
        current_slide.style.cursor = 'move';
        start_slideX = parseInt(current_slide.style.backgroundPositionX.slice(0, -1));
        start_slideY = parseInt(current_slide.style.backgroundPositionY.slice(0, -1));
        start_mouseX = e.offsetX;
        start_mouseY = e.offsetY;
    })

    // Second function calculates movement change from initial parameters set by mousedown, and movement change to change image position

    slider.addEventListener('mousemove', (e) => {
        if (mousedown) {
            moveX = e.offsetX - start_mouseX;
            moveY = e.offsetY - start_mouseY;
            bgPositionX = start_slideX + moveX;
            bgPositionY = start_slideY + moveY;
            if (bgPositionX > 100) {
                bgPositionX = 100;
            } else if (bgPositionX < 0) {
                bgPositionX = 0;
            }
            if (bgPositionY > 100) {
                bgPositionY = 100;
            } else if (bgPositionY < 0) {
                bgPositionY = 0;
            }
            current_slide.style.backgroundPositionX = bgPositionX + "%";
            current_slide.style.backgroundPositionY = bgPositionY + "%";
        }
    })

    // Third function signifies an end to a drag event

    slider.addEventListener('mouseup', (e) => {
        let tag = e.target.tagName;
        if (tag === 'BUTTON' || tag === 'I' || tag === 'INPUT') return;
        current_slide.style.zIndex = '';
        current_slide.style.cursor = 'auto';
        mousedown = false;
    })

    // Fourth function reacts to a invalid mouse move

    slider.addEventListener('mouseleave', (e) => {
        if (mousedown) {
            current_slide.style.zIndex = '';
            current_slide.style.cursor = 'auto';
        }
        mousedown = false;
    })
}

//  Input bar on top of the page

let input = document.querySelector('.form-control');

// Event takes input value, checks whether images were already queried for a certain input. If not, calls a python script that fetches images and a new slider gets created.

input.addEventListener('keyup', function (e) {
    if (e.keyCode === 13) {
        if (Object.keys(cache).length == 0) document.querySelector('.welcome').remove();
        let clean_id = input.value;
        input.value = '';
        if (cache[clean_id]) {
            cache[clean_id][0]++;
            createSlider(cache[clean_id][1], clean_id, cache[clean_id][0]);
            let n = document.querySelector('.container').children.length;
            updateGrid(n);
            if (n == 13 || n == 33) {
                downSizeButtons(n);
            }
            return;
        }
        input.disabled = true;
        let query = clean_id.split(' ').join('+');
        fetch('fetch_images.py', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: query
            })
            .then(response => response.json())
            .then(result => {
                input.disabled = false;
                input.focus();
                createSlider(Object.values(result), clean_id);
                cache[clean_id] = [1, Object.values(result)];
                let n = document.querySelector('.container').children.length;
                updateGrid(n);
                if (n == 13 || n == 33) {
                    downSizeButtons(n);
                }
            });
    }
})

// Adjust the size of the buttons depending on the number of elements in a grid

const downSizeButtons = (n) => {
    let container = document.querySelector('.container');
    if (n < 32 && n > 12) {
        for (const child of container.children) {
            child.classList.add('small');
        }
    } else if (n > 32) {
        for (const child of container.children) {
            child.classList.remove('small');
            child.classList.add('very-small');
        }
    }
}

const upSizeButtons = (n) => {
    let container = document.querySelector('.container');
    if (n <= 12) {
        for (const child of container.children) {
            child.classList.remove('small');
        }
    } else if (n < 33) {
        for (const child of container.children) {
            child.classList.remove('very-small');
            child.classList.add('small');
        }
    }
}