const { Router } = require("express");
const { cnn_mysql } = require("../config/database");
const router = Router();

//Insertar registros en la tabla VEHICULOS
router.post("/nuevo-vehiculo", async (req, res) => {
    try {
        const { NRO_PLACA, ID_LINEA, MODELO, FECHA_VEN_SEGURO, FECHA_VEN_TECNOMECANICA, FECHA_VEN_CONTRATODO } = req.body;
        const [rows] = await cnn_mysql.promise().execute(`INSERT INTO VEHICULOS (NRO_PLACA,ID_LINEA,MODELO,FECHA_VEN_SEGURO,FECHA_VEN_TECNOMECANICA,FECHA_VEN_CONTRATODO) VALUES (?,?,?,?,?,?)`, [NRO_PLACA, ID_LINEA, MODELO, FECHA_VEN_SEGURO, FECHA_VEN_TECNOMECANICA, FECHA_VEN_CONTRATODO]);
        res.json({ message: `Vehiculo agregado exitosamente` });
    } catch (e) {
        res.status(500).json({ errorCode: e.errno, message: "Error en el servidor" });
    }
});
//Verificar cantidad de registros
router.get("/verificar-registros-vehiculos", (req, res) => {
    connection_mysql.query(
        `SELECT COUNT(*) AS registros, IF(COUNT(*) = 30, 'Registros completos','La cantidad de registros no cumple con los requeridos') AS estado_registros FROM VEHICULOS`,
        (error, resultset) => {
            if (error) {
                return res.status(500).send("Se presento un error en la base de datos.");
            } else {
                return res.json(resultset);
            }
        }
    );
});
//Vehiculos por rango de fechas de su seguro
router.get("/rango-fechas", async (req, res) => {
    try {
        const { fecha_minima, fecha_maxima } = req.query;
        const r = await cnn_mysql.promise().execute(`SELECT * FROM VEHICULOS WHERE FECHA_VEN_SEGURO BETWEEN ? AND ?`, [fecha_minima, fecha_maxima]);
        res.json({ message: "Proceso realizado correctamente" });
    } catch (e) {
        res.status(500).json({ errorCode: e.errno, message: "Error en el servidor" });
    }
});
//Vehiculos por rango de modelos
router.get("/rango-modelo", async (req, res) => {
    try {
        const { fecha_minima, fecha_maxima } = req.query;
        const r = await cnn_mysql.promise().execute(`SELECT * FROM VEHICULOS WHERE MODELO BETWEEN ? AND ?`, [fecha_minima, fecha_maxima]);
        res.json({ message: "Proceso realizado correctamente" });
    } catch (e) {
        res.status(500).json({ errorCode: e.errno, message: "Error en el servidor" });
    }
});
//Modificar estado de registro
router.patch('/actualizar-registro-vehiculos/:id', async (req, res) => {
    try {
        if (Object.keys(req.body).length > 0) {
            const id = req.params.id;
            let SQL = 'UPDATE VEHICULOS SET ';
            const params = [];

            for (const element in req.body) {
                SQL += `${element} = ?, `;
                params.push(req.body[element]);
            }
            SQL = SQL.slice(0, -2);
            SQL += ` WHERE NRO_PLACA = ?`;
            params.push(id);
            let [rows] = await connection_mysql.promise().execute(SQL, params);

            if (rows.affectedRows > 0) {
                [rows] = await connection_mysql.promise().query(`SELECT * FROM VEHICULOS WHERE NRO_PLACA = ?`, [id]);
                res.json(rows[0]);
            } else {
                res.json({});
            }
        } else {
            res.status(401).json({ message: 'No existe campos a modificar' });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ errorCode: e.errno, message: "Error en el servidor" });
    }
});
//Registros que coincidan en NRO_PLACA, MODELO, DESC_LINEA, DESC_MARCA
router.get("/coincidencias-registros-tablas", async (req, res) => {
    try {
        const [rows] = await cnn_mysql.promise().execute(`SELECT VEHICULOS.NRO_PLACA, VEHICULOS.MODELO, TIPO_LINEA.DESC_LINEA, TIPO_MARCA.DESC_MARCA FROM VEHICULOS INNER JOIN TIPO_LINEA ON TIPO_LINEA.ID_LINEA = VEHICULOS.ID_LINEA INNER JOIN TIPO_MARCA ON TIPO_MARCA.ID_MARCA = TIPO_LINEA.ID_MARCA`);
        res.json(rows);
    } catch (e) {
        res.status(500).json({ errorCode: e.errno, message: "Error en el servidor" });
    }
});
//Registros que coincidan en NRO_PLACA, MODELO, DESC_LINEA, DESC_MARCA y en estado S
router.get("/coincidencias-registros-tablas-activo", async (req, res) => {
    try {
        const [rows] = await cnn_mysql.promise().execute(`SELECT VEHICULOS.NRO_PLACA, VEHICULOS.MODELO, TIPO_LINEA.DESC_LINEA, TIPO_MARCA.DESC_MARCA FROM VEHICULOS INNER JOIN TIPO_LINEA ON TIPO_LINEA.ID_LINEA = VEHICULOS.ID_LINEA INNER JOIN TIPO_MARCA ON TIPO_MARCA.ID_MARCA = TIPO_LINEA.ID_MARCA WHERE TIPO_LINEA.ACTIVO = 'S'`);
        res.json(rows);
    } catch (e) {
        res.status(500).json({ errorCode: e.errno, message: "Error en el servidor" });
    }
});
//Sumar todos los modelos
router.get("/suma-modelos", async (req, res) => {
    try {
        const [rows] = await cnn_mysql.promise().execute(`SELECT MODELO FROM VEHICULOS`);
        console.log(rows);
        let suma = 0;
        for (let i = 0; i < rows.length; i++) {
            suma += parseInt(rows[i].MODELO);
        }
        res.json({ message: "Suma completa" });

    } catch (e) {
        res.status(500).json({ errorCode: e.errno, message: "Error en el servidor" });
    }
});
//Modelo maximo y minimo
router.get("/max-min-vehiculos", async (req, res) => {
    try {
        const [rows] = await cnn_mysql.execute(`SELECT MIN(MODELO) AS 'modelo_mininimo', MAX(MODELO) AS 'modelo_maximo' FROM VEHICULOS`);
        res.json({ message: "Proceso realizado correctamente" });
    } catch (e) {
        res.status(500).json({ errorCode: e.errno, message: "Error en el servidor" })
    }
});
//Promediar todos los modelos
router.get("/promedio-modelos", async (req, res) => {
    try {
        const [rows] = await cnn_mysql.promise().execute(`SELECT MODELO FROM VEHICULOS`);
        let prom = 0;
        for (let i = 0; i < rows.length; i++) {
            prom += parseInt(rows[i].MODELO);
        }
        res.json({ message: "Modelos promediados" });
    } catch (e) {
        res.status(500).json({ errorCode: e.errno, message: "Error en el servidor" });
    }
});
//Union de tablas con INNER JOIN
router.get("/union-inner", async (req, res) => {
    try {
        const r = await cnn_mysql.promise().execute(`SELECT VEHICULOS.NRO_PLACA, VEHICULOS.MODELO, TIPO_LINEA.DESC_LINEA, TIPO_MARCA.DESC_MARCA FROM VEHICULOS INNER JOIN TIPO_LINEA ON TIPO_LINEA.ID_LINEA = VEHICULOS.ID_LINEA INNER JOIN TIPO_MARCA ON TIPO_MARCA.ID_MARCA = TIPO_LINEA.ID_MARCA`);
        res.json(r);
    } catch (e) {
        res.status(500).json({ errorCode: e.errno, message: "Error en el servidor" });
    }
});
//Union de tablas con LEFT JOIN
router.get("/union-left", async (req, res) => {
    try {
        const r = await cnn_mysql.promise().execute(`SELECT VEHICULOS.NRO_PLACA, VEHICULOS.MODELO, TIPO_LINEA.DESC_LINEA, TIPO_MARCA.DESC_MARCA FROM VEHICULOS LEFT JOIN TIPO_LINEA ON TIPO_LINEA.ID_LINEA = VEHICULOS.ID_LINEA LEFT JOIN TIPO_MARCA ON TIPO_MARCA.ID_MARCA = TIPO_LINEA.ID_MARCA`);
        res.json(r);
    } catch (e) {
        res.status(500).json({ errorCode: e.errno, message: "Error en el servidor" });
    }
});
//Registros sin campos nulos modelo con alias y formato fecha especifico
router.get("/registros-especificos-vehiculos", (req, res) => {
    connection_mysql.query(`SELECT VEHICULOS.NRO_PLACA, VEHICULOS.MODELO AS "#ModeloVehiculo", VEHICULOS.FECHA_VEN_SEGURO, VEHICULOS.FECHA_VEN_TECNOMECANICA, VEHICULOS.FECHA_VEN_CONTRATODO FROM VEHICULOS WHERE VEHICULOS.NRO_PLACA IS NOT NULL AND VEHICULOS.ID_LINEA IS NOT NULL AND VEHICULOS.MODELO IS NOT NULL 
        AND VEHICULOS.FECHA_VEN_SEGURO IS NOT NULL AND VEHICULOS.FECHA_VEN_TECNOMECANICA IS NOT NULL AND VEHICULOS.FECHA_VEN_CONTRATODO IS NOT NULL`,
        (error, resultset, fields) => {
            if (error) {
                return res.status(500).send("Se presento un error en la base de datos.");
            } else {
                return res.json(resultset);
            }
        }
    );
});

module.exports = router;