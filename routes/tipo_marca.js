const { Router } = require("express");
const { cnn_mysql } = require("../config/database");
const router = Router();

//Insertar registros en la tabla TIPO_MARCA
router.post("/nueva-marca", async (req, res) => {
    try {
        const { DESC_MARCA, ACTIVO } = req.body;
        const r = await cnn_mysql.promise().execute(`INSERT INTO TIPO_MARCA (DESC_MARCA,ACTIVO) VALUES (?,?)`, [DESC_MARCA, ACTIVO]);
        res.json({ message: `Marca agregada exitosamente` });
    } catch (e) {
        res.status(500).json({ errorCode: e.errno, message: "Error en el servidor" });
    }
});

//Verificar la cantidad de registros
router.get("/verificar-registros-marca", (req, res) => {
    connection_mysql.query(
        `SELECT COUNT(*) AS registros, IF(COUNT(*) = 5, 'Registros completos','La cantidad de registros no cumple con los requeridos') AS estado_registros FROM TIPO_MARCA;`,
        (error, resultset) => {
            if (error) {
                return res.status(500).send("Se presento un error en la base de datos.");
            } else {
                return res.json(resultset);
            }
        }
    );
});
//Modificar estado de registros
router.patch('/actualizar-registro-marca/:id', async (req, res) => {
    try {
        if (Object.keys(req.body).length > 0) {
            const id = req.params.id;
            let SQL = 'UPDATE TIPO_LINEA SET ';
            const params = [];

            for (const element in req.body) {
                SQL += `${element} = ?, `;
                params.push(req.body[element]);
            }
            SQL = SQL.slice(0, -2);
            SQL += ` WHERE ID_LINEA = ?`;
            params.push(id);
            let [rows] = await connection_mysql.promise().execute(SQL, params);

            if (rows.affectedRows > 0) {
                [rows] = await connection_mysql.promise().query(`SELECT * FROM TIPO_LINEA WHERE ID_LINEA = ?`, [id]);
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
//Crear marca adicional
router.post("/marca-adicional", async (req, res) => {
    try {
        const { ID_MARCA, DESC_MARCA, ACTIVO } = req.body;
        const r = await cnn_mysql.execute(`INSERT INTO TIPO_MARCA (ID_MARCA, DESC_MARCA, ACTIVO) VALUES (?, ?, ?)`, [ID_MARCA, DESC_MARCA, ACTIVO]);
        res.json({ message: "Nueva marca agregada" });
    } catch (e) {
        res.status(500).json({ errorCode: e.errno, message: "Error en el servidor" })
    }
});
//Eliminar marca
router.delete("/marca/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const r = await cnn_mysql.execute(`DELETE FROM TIPO_MARCA WHERE ID_MARCA = ?`, [id]);
        res.json({ message: "Registro eliminado" });
    } catch (e) {
        res.status(500).json({ errorCode: e.errno, message: "Error en el servidor" })
    }
});
//Registros sin campos nulos y estado activo e inactivo
router.get("/registros-especificos-marca", (req, res) => {
    connection_mysql.query(`SELECT TIPO_MARCA.ID_MARCA, TIPO_MARCA.DESC_MARCA, IF(ACTIVO = "S", "Activo", "Inactivo") AS ESTADO FROM TIPO_MARCA WHERE TIPO_MARCA.ID_MARCA 
    IS NOT NULL AND TIPO_MARCA.DESC_MARCA IS NOT NULL AND TIPO_MARCA.ACTIVO IS NOT NULL`,
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