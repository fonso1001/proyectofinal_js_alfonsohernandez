

document.getElementById('submit').addEventListener('click', manejarCalculo);
document.getElementById('showInversions').addEventListener('click', function() {
    document.getElementById('pastInversions').style.display = 'block';
    document.getElementById('hideInversions').style.display = 'block';
    actualizarInversionesPasadas();
});

document.getElementById('hideInversions').addEventListener('click', function() {
    document.getElementById('pastInversions').style.display = 'none';
    document.getElementById('hideInversions').style.display = 'none';
});

let inversionesRealizadas = JSON.parse(localStorage.getItem('inversionesRealizadas')) || [];
let calculosCancelados = JSON.parse(localStorage.getItem('calculosCancelados')) || [];


function manejarCalculo() {
    let monto = parseFloat(document.getElementById('monto').value);
    let perfil = document.getElementById('perfil').value;
    let plazo = parseInt(document.getElementById('plazo').value);
    let divisa = document.getElementById('moneda').value;

    let resultadoDeLaInversion = calcularInversion(monto, perfil, plazo);

    convertirDivisa(resultadoDeLaInversion, 'USD', divisa)
        .then(conversion => {
            let textoResultado = document.getElementById('textoResultado');
            textoResultado.innerHTML = `
                Invertiste: ${monto} USD<br>
                Tu perfil es: ${perfil}<br>
                El plazo que elegiste es de: ${plazo} años<br>
                Tu retorno al finalizar el plazo es: ${conversion} ${divisa}<br><br>
                <button id="btnInvertir">Invertir</button>
                <button id="btnCancelar">Cancelar</button>
            `;
            document.getElementById('btnInvertir').addEventListener('click', function() {
                let fechaActual = luxon.DateTime.now().toFormat('yyyy-MM-dd');
                inversionesRealizadas.push({ fecha: fechaActual, monto, perfil, plazo, resultado: conversion });
                localStorage.setItem('inversionesRealizadas', JSON.stringify(inversionesRealizadas));
                actualizarInversionesPasadas();
                textoResultado.innerText = ''; // Limpiar los resultados
                document.getElementById('mensajeInversion').innerText = "¡Felicidades! Gracias por invertir con nosotros.";
            });
            
            document.getElementById('btnCancelar').addEventListener('click', function() {
                let fechaActual = luxon.DateTime.now().toFormat('yyyy-MM-dd');
                calculosCancelados.push({ fecha: fechaActual, monto, perfil, plazo, resultado: conversion });
                localStorage.setItem('calculosCancelados', JSON.stringify(calculosCancelados));
                textoResultado.innerText = ''; 
            });
            
            let fechaActual = luxon.DateTime.now().toFormat('yyyy-MM-dd');
            inversionesRealizadas.push({ fecha: fechaActual, monto, perfil, plazo, resultado: conversion });
            localStorage.setItem('inversionesRealizadas', JSON.stringify(inversionesRealizadas));

            actualizarInversionesPasadas();
        })
        .catch(error => {
            console.error('Hubo un error al obtener los datos de la inversión:', error);
        });
}


function actualizarInversionesPasadas() {
    let pastInversionsDiv = document.getElementById('pastInversions');
    let htmlContent = inversionesRealizadas.map((inversion, index) => `
        Fecha: ${inversion.fecha}<br>
        Invertiste: ${inversion.monto} USD<br>
        Perfil: ${inversion.perfil}<br>
        Plazo: ${inversion.plazo} años<br>
        Resultado: ${inversion.resultado}<br>
        <button onclick="eliminarInversion(${index})">Eliminar</button>
        <hr>
    `).join('');
    pastInversionsDiv.innerHTML = htmlContent;
}

function eliminarInversion(index) {
    inversionesRealizadas.splice(index, 1);
    localStorage.setItem('inversionesRealizadas', JSON.stringify(inversionesRealizadas));
    actualizarInversionesPasadas();
}

function mostrarInversionesPasadas() {
    actualizarInversionesPasadas();
}

function calcularInversion(monto, perfil, plazo) {
    monto = parseFloat(monto);
    plazo = parseInt(plazo);
    let inversionFinal = 0;

    if (perfil === "conservador") {
        if (plazo === 1) inversionFinal = monto * 1.05;
        else if (plazo === 3) inversionFinal = monto * 1.18;
        else if (plazo === 5) inversionFinal = monto * 1.40;
    } else if (perfil === "moderado") {
        if (plazo === 1) inversionFinal = monto * 1.07;
        else if (plazo === 3) inversionFinal = monto * 1.21;
        else if (plazo === 5) inversionFinal = monto * 1.46;
    } else if (perfil === "agresivo") {
        if (plazo === 1) inversionFinal = monto * 1.10;
        else if (plazo === 3) inversionFinal = monto * 1.25;
        else if (plazo === 5) inversionFinal = monto * 1.50;
    }

    return inversionFinal;
}

function convertirDivisa(monto, divisaOrigen, divisaDestino) {
    const claveAPI = '917e2c04043fdc130d2e0a96';
    const endpoint = `https://v6.exchangerate-api.com/v6/${claveAPI}/pair/${divisaOrigen}/${divisaDestino}/${monto}`;

    return fetch(endpoint)
        .then(respuesta => respuesta.json())
        .then(data => {
            if (data.result === 'success') {
                return data.conversion_result;
            } else {
                throw new Error(data['error-type']);
            }
        });
}




