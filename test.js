var a = 2

updateVar = function (callback) {
    a = 1;
    console.log(a);
    callback();
};

updateVar2 = function() {
    console.log(a);
};
console.log(a);

updateVar(updateVar2);
