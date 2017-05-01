angular.module('um-s', [])
.controller('um-sCtrl', ($scope)=> {
    $scope.input = '#init\n' +
	'\t0000 23;comment example\n' +
	'\t0003 32;\n' +
    '\t0006 23;\n' +
	'\t0009 23;\n' +
    '#end\n' +
    '#code\n' +
    '\t0100 5B 0003;comment example\n' +
	'\t0103 5A 0006;\n' +
	'\t0106 01;\n' +
	'\t0109 14;\n' +
    '#end;\n' ;
    $scope.variables = [];
    $scope.errors = 0;
    $scope.actions = [];
    $scope.rows = [1];

    $scope.execute = ()=> {
        document.getElementById('outputBody').innerHTML = '';
        $scope.writeMessageToOutput('Compiling...');

        let initBlock = "";  
        let codeBlock = "";
        $scope.errors = 0;
        let firstEndIndex = $scope.input.length;
        let secondEndIndex = 0;

        // initialization handling
        try{// to find #init
            if( $scope.input.indexOf('#init') >= 0 ){
    
            }else {
                $scope.errors++;
                throw new Error();
            }
        }catch (err){
            $scope.writeErrorsToOutput('#init missed');
        }

        try{// to find #end
            if( $scope.input.indexOf('#end') >= 0 ){
                firstEndIndex = $scope.input.indexOf('#end') + 3;
                if($scope.errors == 0){
                    initBlock = $scope.input.substring($scope.input.indexOf('#init') + 5, $scope.input.indexOf('#end'));
                }
            }else {
                $scope.errors++;
                throw new Error();
            }
        }catch (err){
            $scope.writeErrorsToOutput('#end missed(init)');
        }

        // code handling
        try{ // to find #code
            if( $scope.input.indexOf('#code') >= 0 ){
                
            }else {
                $scope.errors++;
                throw new Error();
            }
        }catch (err){
            $scope.writeErrorsToOutput('#code missed');
        }

        try{ // to find #end(сode)
            if( $scope.input.indexOf('#end', firstEndIndex + 1) >= 0 ){
                secondEndIndex = $scope.input.indexOf('#end', firstEndIndex + 1);
                if($scope.errors == 0){
                    codeBlock = $scope.input.substring($scope.input.indexOf('#code') + 5, secondEndIndex);
                }
            }else {
                $scope.errors++;
                throw new Error();
            }
        }catch (err){
            $scope.writeErrorsToOutput('#end missed');
        }

        // errors handling
        if( firstEndIndex >= $scope.input.indexOf('#code') || $scope.input.indexOf('#init') >= firstEndIndex){
            $scope.errors++;
            $scope.writeErrorsToOutput('Use next structure:<br>1.#init<br>2.#end<br>3.#code<br>4.#end');
        }
        if($scope.errors > 0){// show errors number
            $scope.writeErrorsToOutput($scope.errors + ' errors');
        }else{
            $scope.firstEndIndex = firstEndIndex;
            $scope.parseCode( initBlock, codeBlock);
        }
    };

    $scope.writeErrorsToOutput = (message)=> {
        document.getElementById('outputBody').innerHTML += "<div class='error'>" + message + "</div><br>";
    };
    $scope.writeMessageToOutput = (message)=> {
        document.getElementById('outputBody').innerHTML += "<div class='message'>" + message + "</div><br>";
    };
    $scope.writeSuccessToOutput = (message)=> {
        document.getElementById('outputBody').innerHTML += "<div class='success'>" + message + "</div><br>";
    };

    $scope.parseCode = ( initBlock, codeBlock)=> {
        // init block ----------------------------
        initBlock =  initBlock.split('\n');
        initBlock.splice(0,1);
        initBlock.splice( initBlock.length - 1, 1);
        initBlock.forEach((element, i, arr)=> {
            try{
                element = element.split(/\s/g);
                if(element[0] == ""){
                    element.splice(0,1);
                }

                if(element[1].indexOf(';') >= 0){
                    element[1] = element[1].substring(0, element[1].indexOf(';'));
                }

                if(parseInt(element[0], 16) != parseInt(toHex(i*3), 16)){
                    throw new Error();
                }

                element = {
                    location: element[0],
                    value: element[1]
                };

                if(typeof parseInt(element.location) != 'number'){
                    console.log(typeof parseInt(element.location));
                }

                arr[i] = element;
            }catch(err) {
                $scope.errors++;
                $scope.writeErrorsToOutput(`Incorrect input at ${i+1}(expect ${element[0]} to be 000${toHex(i*3)})`);
            }
        });
        // code block ----------------------------
        codeBlock =  codeBlock.split('\n');
        codeBlock.splice(0,1);
        codeBlock.splice( codeBlock.length - 1, 1);

        codeBlock.forEach((element, i, arr)=> {
            try{
                element = element.split(/\s/g);
                if(element[0] == ""){
                        element.splice(0, 1);
                }
                if(element[1].indexOf(';') >= 0){
                    element[1] = element[1].substring(0, element[1].indexOf(';'));
                }
                if(element[2] != undefined && element[2].indexOf(';') >= 0){
                    element[2] = element[2].substring(0, element[2].indexOf(';'));
                }
                if(parseInt(element[0], 16) != toDec((i*3)+100) ){
                    throw new Error('incorrect adress');
                }
                if(element[2] == undefined || element[2] == null){
                    element[2] = "";
                    if(!['01','02', '03', '13', '04', '14', '05', '5C', '5D', '99'].includes(element[1])){
                        throw new Error('incorrect cmd');
                    }
                }else {
                    let isCorrectMemoryField = false;
                    initBlock.forEach((it)=> {
                        if(it.location == element[2]){
                            isCorrectMemoryField = true;
                        }
                        console.log(it.location, element[2]);
                    });
                    if(!isCorrectMemoryField){
                        throw new Error('incorrect memory field');
                    }
                    if(!['5A', '5B', '99'].includes(element[1])){
                        throw new Error('incorrect cmd');
                    }
                }
                element = {
                    location: element[0],
                    cmd: element[1],
                    memory: element[2]
                };
                arr[i] = element;
            }catch(err) {
                console.log(err);
                $scope.errors++;
                $scope.writeErrorsToOutput(`Incorrect input at ${$scope.rows[$scope.rows.length -2] - arr.length + i}(expect ${element[0]} to be 010${toHex(i*3)})`);
            }
        });

        if($scope.errors > 0){
            $scope.writeErrorsToOutput($scope.errors + ' errors');
        }else {
            $scope.writeMessageToOutput('Values are stored in memory');
            $scope.writeMessageToOutput('Compiled');
            $scope.writeSuccessToOutput('No errors');
            $scope.variables = initBlock; 
        }
    };

    $scope.addRows = (e)=> {
        let rows = 1;
        $scope.rows = [1];
        let input = $scope.input;
        while(input.indexOf('\n') != -1){
            rows++;
            $scope.rows.push(rows);
            input = input.substring(input.indexOf('\n') + 1, input.length);
        };
        rows++;
        $scope.rows.push(rows);
    };
});

function toHex( number ){
    return number.toString(16);
};

function toDec( number ){
    return parseInt( number, 16);
};
