const fields = document.querySelectorAll(".word");
const keys = document.querySelectorAll(".key");
const layout = document.querySelector(".layout");
const game_start = document.querySelector(".game_start");
const game_over = document.querySelector(".game_over");
const word_start = document.querySelector(`input[type="text"]`);
const message = document.querySelector(".message");
const cyrillic = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split('');
const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
let pos = 0, key = ``, hidden_word = ``, time;
let c_keys = new Map(), colors = new Map();

function init_game() {
    for(let y = 0; y < keys.length; y++) {
        c_keys.set(keys[y].innerHTML.trim(), ``);
        keys[y].addEventListener('click', field_filling);
    }
    colors.set("BLACK", "#000000");
    colors.set("YELLOW", "#E5CE2D");
    colors.set("GREEN", "#65E065");

    word_start.addEventListener('keyup', start);
}

function start(event) {
    let w = word_start.value.toUpperCase();
    if(w.match(/[A-Z]/)) message_output("Switch layout");
    if(event.key.toUpperCase() == "ENTER") {
        if(w.match(/^[А-ЯЁ]{5}$/)) {
            if(check_word(w, word_start.value[0].toUpperCase())) {
                hidden_word = w;
                game_start.style.display = "none";
                layout.style.display = "none";
                time = setTimeout(end, 3 * 10 ** 5, "LOSE");
                document.addEventListener('keydown', field_filling);
                document.removeEventListener('keydown', start);
            } else message_output("The word doesn't exist");
        } else if(w.length < 5) message_output("Not enough letters");
        else if(w.length > 5) message_output("Too much letters");
    }
}

function end(state) {
    document.removeEventListener('keydown', field_filling);

    layout.style.display = "flex";
    game_over.style.display = "flex";
    if(state == "WIN") {
        game_over.children[0].innerHTML = "Congratulations";
        game_over.children[1].innerHTML = "You've won!";
    } else if(state == "LOSE") {
        game_over.children[0].innerHTML = "Unfortunately you lost!";
        game_over.children[1].innerHTML = `Hidden word: ${hidden_word.toUpperCase()}`;
    }
    document.addEventListener('keydown', clear);
}

function clear(event) {
    if(event.key.toUpperCase() == "ENTER"){
        hidden_word = ``;
        word_start.value = ``;
        pos = 0;
        key = ``;
        c_keys = new Map();
        colors = new Map();
        game_over.style.display = "none";
        game_start.style.display = "flex";
        for(let i = 0; i <= 5; i++) {
            for(let j = 0; j <= 4; j++) {
                fields[i].children[j].style.background = ``;
                fields[i].children[j].innerHTML = ``;
            }
        }
        for(let i = 0; i < keys.length; i++) {
            keys[i].style.background = ``;
            keys[i].removeEventListener('click', field_filling);
        }
        document.removeEventListener('keydown', clear);
        clearTimeout(time);
        init_game();
    }
}
function convert_color(color) {
    color = color.substring(1);
    return `rgb(${parseInt(color.substring(0,2),16)}, ${parseInt(color.substring(2,4),16)}, ${parseInt(color.substring(4),16)})`;
}

function check_winning() {
    for(let i = 0; i < 5; i++) {
        if(fields[Math.floor(pos / 5)].children[i].style.background != convert_color(colors.get("GREEN"))) return false;
    }
    return true;
}

function field_coloring(color, index, letter) {
    fields[Math.floor(pos / 5)].children[index].style.background = color;
    for(let x = 0; x < keys.length; x++) {
        if(letter == keys[x].innerHTML.trim()) {
            if(!c_keys.get(letter)) c_keys.set(letter, color);
            else if((c_keys.get(letter) == colors.get("BLACK") && color == colors.get("YELLOW"))) c_keys.set(letter, colors.get("YELLOW"));
            else if(c_keys.get(letter) == colors.get("YELLOW") && color == colors.get("GREEN")) c_keys.set(letter, colors.get("GREEN"));
            keys[x].style.background = c_keys.get(letter);
        }
    }
}

function letter_matching(word) {
    for(let i = 0; i < 5; i++) {
        if(word[i] == hidden_word[i]) field_coloring(colors.get("GREEN"), i, word[i]);
        else {
            for(let j = 0; j < 5; j++) {
                if(word[i] == hidden_word[j]) {
                    field_coloring(colors.get("YELLOW"), i, word[i]);
                    break;
                } else field_coloring(colors.get("BLACK"), i, word[i]);
            }
        }
    }
}

function check_word(word, letter) {
    for(let i = 0; i < word_list[letter]?.length; i++) {
        if(word_list[letter][i].toUpperCase() == word) return true;
    }
    return false;
}

function combination_letters() {
    let entered_word = ``;
    for(let i = 0; i < 5; i++) {
        entered_word += fields[Math.floor(pos / 5)].children[i].innerHTML;
    }
    if(check_word(entered_word, fields[Math.floor(pos / 5)].children[0].innerHTML)) {
        letter_matching(entered_word);
        return true;
    } else {
        message_output("The word doesn't exist");
        return false;
    }
}

function enter_letter(key) {
    fields[Math.floor(pos / 5)].children[pos % 5].innerHTML = `${key}`;
}

function field_fullness() {
    return fields[Math.floor(pos / 5)].children[pos % 5].innerHTML;
}

function key_check(key) {
    for(let k = 0; k < cyrillic.length; k++) {
        if(k < latin.length && latin[k] == key) message_output("Switch layout");
        if(cyrillic[k] == key) return true;
    }
    return false;
}

function message_output(text) {
    message.style.opacity = '1';
    message.children[0].innerHTML = text;
    message.style.transform = "translate(-50%, 20%)";
    message_time = setTimeout(delete_message, 3 * 1000);
}

function delete_message() {
    message.style.opacity = '0';
    message.style.transform = "translate(-50%, -100%)";
    clearTimeout(message_time);
}

function field_filling(event) {
    if(event.target.tagName == "BODY"){
        key = event.key.toUpperCase();
    } else if(event.target.tagName == "SPAN") {
        key = event.target.innerHTML.trim()
    }
    
    if(key_check(key)){
        if(pos % 5 <= 4 && !field_fullness()) enter_letter(key);
        if(pos % 5 < 4) pos++;
    } else if(key == "BACKSPACE" || key == "◄") {
        if(pos % 5 > 0 && !(pos % 5 == 4 && field_fullness())) pos--;
        enter_letter(``);
    } else if(key == "ENTER" || key == "►") {
        if(pos % 5 == 4 && field_fullness()) {
            if(Math.floor(pos / 5) < 5) {
                if(combination_letters()) {
                    if(check_winning()) end("WIN");
                    pos++;
                }
            } else {
                if(combination_letters()) {
                    if(check_winning()) end("WIN");
                    else end("LOSE");
                }
            }
        } else message_output("Not enough letters");
    }
}

init_game();