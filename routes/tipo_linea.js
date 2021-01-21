const { Router } = require("express");
const { cnn_mysql } = require("../config/database");
const router = Router();

//Insertar registros en la tabla TIPO_LINEA
router.post("/nueva-linea", async (req, res) => {
    try {
        const { DESC_LINEA, ID_MARCA, ACTIVO } = req.body;
        const r = await cnn_mysql.promise().execute(`INSERT INTO TIPO_LINEA (DESC_LINEA,ID_MARCA,ACTIVO) VALUES (?,?,?)`, [DESC_LINEA, ID_MARCA, ACTIVO]);
        res.json({ message: `Linea agregada exitosamente` });
    } catch (e) {
        res.status(500).json({ errorCode: e.errno, message: "Error en el servidor" });
    }
});

//Verificar la cantidad de registros
router.get("/verificar-registros-linea", (req, res) => {
    connection_mysql.query(
        `SELECT COUNT(*) AS registros, IF(COUNT(*) = 20, 'Registros completos','La cantidad de registros no cumple con los requeridos') AS estado_registros FROM TIPO_LINEA`,
        (error, resultset) => {
            if (error) {
                return res.status(500).send("Se presento un error en la base de datos.");
            } else {
                return res.json(resultset);
            }
        }
    );
});
//Consultar cantidad de lineas por marca
router.get("/lineas-por-marca", async (req, res) => {
    try {
        const r = await cnn_mysql.promise().execute(`SELECT TIPO_LINEA.DESC_LINEA, TIPO_MARCA.DESC_MARCA, COUNT(*) AS 'CANTIDAD' FROM TIPO_LINEA INNER JOIN TIPO_MARCA ON TIPO_MARCA.ID_MARCA = TIPO_LINEA.ID_MARCA GROUP BY TIPO_MARCA.DESC_MARCA, TIPO_LINEA.DESC_LINEA`);
        res.json({ message: "Proceso realizado correctamente" })
    } catch (e) {
        res.status(500).json({ errorCode: e.errno, message: "Error en el servidor" })
    }
});
//Modificar estado de registro
router.patch('/actualizar-registro-linea/:id', async (req, res) => {
    try {
        if (Object.keys(req.body).length > 0) {
            const id = req.params.id;
            let SQL = 'UPDATE TIPO_MARCA SET ';
            const params = [];

            for (const element in req.body) {
                SQL += `${element} = ?, `;
                params.push(req.body[element]);
            }
            SQL = SQL.slice(0, -2);
            SQL += ` WHERE ID_MARCA = ?`;
            params.push(id);
            let [rows] = await connection_mysql.promise().execute(SQL, params);

            if (rows.affectedRows > 0) {
                [rows] = await connection_mysql.promise().query(`SELECT * FROM TIPO_MARCA WHERE ID_MARCA = ?`, [id]);
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
//Registros activos e inactivos
router.get("/registros-activos-inactivos", (req, res) => {
    connection_mysql.query(
        `SELECT SUM(ACTIVO = 'S') AS ACTIVOS, SUM(ACTIVO = 'N') AS INACTIVOS FROM TIPO_LINEA`,
        (error, resultset, fields) => {
            if (error) {
                return res.status(500).send("Se presento un error en la base de datos.");
            } else {
                return res.json(resultset);
            }
        }
    );
});
//Registros sin campos nulos y estado activo e inactivo
router.get("/registros-especificos-linea", (req, res) => {
    connection_mysql.query(`SELECT TIPO_LINEA.ID_LINEA, TIPO_LINEA.DESC_LINEA, IF(ACTIVO = "S", "Activo", "Inactivo") AS 
    ESTADO FROM TIPO_LINEA WHERE TIPO_LINEA.ID_LINEA IS NOT NULL AND TIPO_LINEA.DESC_LINEA IS NOT NULL AND TIPO_LINEA.ID_MARCA IS NOT NULL AND TIPO_LINEA.ACTIVO
    `,
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