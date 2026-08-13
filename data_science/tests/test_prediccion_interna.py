from fastapi.testclient import TestClient

from main import app

PAYLOAD_VALIDO = {
    "usuarioId": "USR-4521",
    "transacciones": [
        {"idTransaccion": "TX-00123", "descripcion": "Pago renta departamento", "monto": 8500.00, "fecha": "2026-07-15"},
        {"idTransaccion": "TX-00124", "descripcion": "Uber Eats cena", "monto": 245.50, "fecha": "2026-07-16"},
    ],
    "ingresoMensual": 25000.00,
    "nivelEndeudamiento": 35,
    "frecuenciaAhorro": "Media",
}

ETIQUETAS_PERFIL_VALIDAS = {"En observacion", "En riesgo", "Finanzas sanas"}


def test_prediccion_interna_no_lanza_value_error_de_shape():
    with TestClient(app) as client:
        response = client.post("/prediccion-interna", json=PAYLOAD_VALIDO)

    assert response.status_code == 200
    body = response.json()
    assert "valor" in body["perfil"]
    assert body["perfil"]["featuresUsadas"]["nivelEndeudamiento"] == 35


def test_prediccion_interna_sin_nivel_endeudamiento_usa_default():
    payload = {**PAYLOAD_VALIDO, "nivelEndeudamiento": None}
    with TestClient(app) as client:
        response = client.post("/prediccion-interna", json=payload)

    assert response.status_code == 200


def test_perfil_valor_es_etiqueta_de_texto_no_indice_numerico():
    with TestClient(app) as client:
        response = client.post("/prediccion-interna", json=PAYLOAD_VALIDO)

    assert response.status_code == 200
    valor = response.json()["perfil"]["valor"]
    assert valor in ETIQUETAS_PERFIL_VALIDAS


def test_frecuencia_ahorro_acepta_baja_media_alta():
    # Contrato acordado con el equipo (reunion 2026-08-13): frecuencia_ahorro se
    # queda en 3 valores (Baja/Media/Alta) en front y back, no se amplia.
    for valor in ["Baja", "Media", "Alta"]:
        payload = {**PAYLOAD_VALIDO, "frecuenciaAhorro": valor}
        with TestClient(app) as client:
            response = client.post("/prediccion-interna", json=payload)
        assert response.status_code == 200, f"fallo con frecuenciaAhorro={valor!r}"
