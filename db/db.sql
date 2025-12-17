-- =============================================
-- BASE DE DATOS: SISTEMA DE REGISTRO DE PELÍCULAS Y SERIES
-- API EXTERNA: TMDB (The Movie Database)
-- =============================================

-- Crear la base de datos
CREATE DATABASE SistemaVisualizacionesTMDB;
GO

USE SistemaVisualizacionesTMDB;
GO

-- =============================================
-- TABLA: Usuarios
-- =============================================
CREATE TABLE Usuarios (
    usuario_id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_nombre VARCHAR(50) UNIQUE NOT NULL,
    -- En un sistema real, almacenaríamos un hash de la contraseña, no el texto plano
    usuario_contrasena_hash VARCHAR(255) NOT NULL,
    usuario_edad INT NOT NULL,
    usuario_fecha_registro DATETIME DEFAULT GETDATE(),
    usuario_activo BIT DEFAULT 1,
    
    -- Restricciones
    CONSTRAINT CHK_Usuario_Edad CHECK (usuario_edad >= 0 AND usuario_edad <= 120),
    CONSTRAINT CHK_Usuario_Nombre CHECK (LEN(usuario_nombre) >= 3)
);
GO

-- =============================================
-- TABLA: TiposContenido
-- =============================================
CREATE TABLE TiposContenido (
    tipo_id INT PRIMARY KEY,
    tipo_nombre VARCHAR(20) NOT NULL
);
GO

-- Insertar tipos de contenido predefinidos
INSERT INTO TiposContenido (tipo_id, tipo_nombre) VALUES
(1, 'Película'),
(2, 'Serie');
GO

-- =============================================
-- TABLA: ContenidosTMDB
-- =============================================
-- Esta tabla almacena referencias a los contenidos de TMDB
-- No contiene toda la información, solo los IDs y datos básicos para evitar duplicación
CREATE TABLE ContenidosTMDB (
    contenido_id INT PRIMARY KEY, -- ID de TMDB
    tipo_id INT NOT NULL, -- 1: Película, 2: Serie
    contenido_titulo VARCHAR(255), -- Podríamos almacenar el título para facilitar consultas
    contenido_fecha_sincronizacion DATETIME DEFAULT GETDATE(),
    
    -- Restricciones
    FOREIGN KEY (tipo_id) REFERENCES TiposContenido(tipo_id)
);
GO

-- =============================================
-- TABLA: Visualizaciones
-- =============================================
-- Registro principal de lo que el usuario ha visto
CREATE TABLE Visualizaciones (
    visualizacion_id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    contenido_id INT NOT NULL, -- ID de TMDB
    tipo_id INT NOT NULL, -- 1: Película, 2: Serie
    fecha_visualizacion DATETIME DEFAULT GETDATE(),
    fecha_actualizacion DATETIME DEFAULT GETDATE(),
    
    -- Restricciones
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id),
    FOREIGN KEY (contenido_id) REFERENCES ContenidosTMDB(contenido_id),
    FOREIGN KEY (tipo_id) REFERENCES TiposContenido(tipo_id),
    
    -- Un usuario solo puede tener un registro por contenido
    CONSTRAINT UC_Usuario_Contenido UNIQUE (usuario_id, contenido_id)
);
GO

-- =============================================
-- TABLA: Calificaciones
-- =============================================
CREATE TABLE Calificaciones (
    calificacion_id INT IDENTITY(1,1) PRIMARY KEY,
    visualizacion_id INT NOT NULL,
    -- Calificación del 1 al 10 (podría ser también 1-5 estrellas)
    puntuacion DECIMAL(3,1) NOT NULL,
    fecha_calificacion DATETIME DEFAULT GETDATE(),
    fecha_actualizacion DATETIME DEFAULT GETDATE(),
    
    -- Restricciones
    FOREIGN KEY (visualizacion_id) REFERENCES Visualizaciones(visualizacion_id),
    CONSTRAINT CHK_Puntuacion_Rango CHECK (puntuacion >= 1 AND puntuacion <= 10)
);
GO

-- =============================================
-- TABLA: Reseñas
-- =============================================
CREATE TABLE Reseñas (
    reseña_id INT IDENTITY(1,1) PRIMARY KEY,
    visualizacion_id INT NOT NULL,
    reseña_texto TEXT,
    contiene_spoilers BIT DEFAULT 0,
    fecha_reseña DATETIME DEFAULT GETDATE(),
    fecha_actualizacion DATETIME DEFAULT GETDATE(),
    
    -- Restricciones
    FOREIGN KEY (visualizacion_id) REFERENCES Visualizaciones(visualizacion_id)
);
GO

-- =============================================
-- TABLA: EstadosVisualizacion (Opcional)
-- =============================================
-- Para series, podríamos querer registrar el estado
CREATE TABLE EstadosVisualizacion (
    estado_id INT PRIMARY KEY,
    estado_nombre VARCHAR(20) NOT NULL
);
GO

INSERT INTO EstadosVisualizacion (estado_id, estado_nombre) VALUES
(1, 'Completado'),
(2, 'En progreso'),
(3, 'Abandonado'),
(4, 'Planeado ver');
GO

-- =============================================
-- TABLA: EpisodiosVistos (Solo para series)
-- =============================================
CREATE TABLE EpisodiosVistos (
    episodio_id INT IDENTITY(1,1) PRIMARY KEY,
    visualizacion_id INT NOT NULL,
    -- TMDB tiene IDs para temporadas y episodios
    temporada_tmdb_id INT NOT NULL,
    episodio_tmdb_id INT NOT NULL,
    fecha_visto DATETIME DEFAULT GETDATE(),
    
    -- Restricciones
    FOREIGN KEY (visualizacion_id) REFERENCES Visualizaciones(visualizacion_id),
    
    -- Un episodio solo puede ser marcado como visto una vez por visualización
    CONSTRAINT UC_Episodio_Visto UNIQUE (visualizacion_id, temporada_tmdb_id, episodio_tmdb_id)
);
GO

-- =============================================
-- ÍNDICES PARA MEJORAR EL RENDIMIENTO
-- =============================================

-- Índices para Usuarios
CREATE INDEX IX_Usuarios_Nombre ON Usuarios(usuario_nombre);
CREATE INDEX IX_Usuarios_Activo ON Usuarios(usuario_activo);

-- Índices para Visualizaciones
CREATE INDEX IX_Visualizaciones_Usuario ON Visualizaciones(usuario_id);
CREATE INDEX IX_Visualizaciones_Contenido ON Visualizaciones(contenido_id);
CREATE INDEX IX_Visualizaciones_Fecha ON Visualizaciones(fecha_visualizacion);

-- Índices para Calificaciones
CREATE INDEX IX_Calificaciones_Visualizacion ON Calificaciones(visualizacion_id);
CREATE INDEX IX_Calificaciones_Puntuacion ON Calificaciones(puntuacion);

-- Índices para Reseñas
CREATE INDEX IX_Reseñas_Visualizacion ON Reseñas(visualizacion_id);
CREATE INDEX IX_Reseñas_Fecha ON Reseñas(fecha_reseña);

-- Índices para EpisodiosVistos
CREATE INDEX IX_EpisodiosVistos_Visualizacion ON EpisodiosVistos(visualizacion_id);
CREATE INDEX IX_EpisodiosVistos_Fecha ON EpisodiosVistos(fecha_visto);

-- =============================================
-- VISTAS ÚTILES
-- =============================================

-- Vista para ver el historial completo de un usuario
CREATE VIEW VistaHistorialUsuario AS
SELECT 
    u.usuario_nombre,
    c.contenido_id AS tmdb_id,
    tc.tipo_nombre AS tipo_contenido,
    c.contenido_titulo,
    v.fecha_visualizacion,
    cal.puntuacion,
    r.reseña_texto,
    r.contiene_spoilers
FROM Usuarios u
INNER JOIN Visualizaciones v ON u.usuario_id = v.usuario_id
INNER JOIN ContenidosTMDB c ON v.contenido_id = c.contenido_id
INNER JOIN TiposContenido tc ON v.tipo_id = tc.tipo_id
LEFT JOIN Calificaciones cal ON v.visualizacion_id = cal.visualizacion_id
LEFT JOIN Reseñas r ON v.visualizacion_id = r.visualizacion_id;
GO

-- Vista para ver las mejores calificaciones
CREATE VIEW VistaTopCalificaciones AS
SELECT 
    c.contenido_titulo,
    tc.tipo_nombre AS tipo_contenido,
    AVG(cal.puntuacion) AS promedio_calificacion,
    COUNT(cal.calificacion_id) AS total_calificaciones
FROM ContenidosTMDB c
INNER JOIN Visualizaciones v ON c.contenido_id = v.contenido_id
INNER JOIN TiposContenido tc ON c.tipo_id = tc.tipo_id
INNER JOIN Calificaciones cal ON v.visualizacion_id = cal.visualizacion_id
GROUP BY c.contenido_id, c.contenido_titulo, tc.tipo_nombre
HAVING COUNT(cal.calificacion_id) >= 3;
GO

-- =============================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- =============================================

-- Procedimiento para registrar una nueva visualización
CREATE PROCEDURE sp_RegistrarVisualizacion
    @usuario_id INT,
    @contenido_tmdb_id INT,
    @tipo_contenido_id INT,
    @titulo_contenido VARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Verificar si el contenido ya existe en nuestra referencia
        IF NOT EXISTS (SELECT 1 FROM ContenidosTMDB WHERE contenido_id = @contenido_tmdb_id)
        BEGIN
            -- Insertar referencia al contenido de TMDB
            INSERT INTO ContenidosTMDB (contenido_id, tipo_id, contenido_titulo)
            VALUES (@contenido_tmdb_id, @tipo_contenido_id, @titulo_contenido);
        END
        
        -- Registrar la visualización
        INSERT INTO Visualizaciones (usuario_id, contenido_id, tipo_id)
        VALUES (@usuario_id, @contenido_tmdb_id, @tipo_contenido_id);
        
        COMMIT TRANSACTION;
        
        SELECT 'Visualización registrada exitosamente' AS Mensaje,
               SCOPE_IDENTITY() AS visualizacion_id;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        SELECT 'Error al registrar visualización: ' + @ErrorMessage AS Mensaje;
    END CATCH
END;
GO

-- Procedimiento para agregar calificación
CREATE PROCEDURE sp_AgregarCalificacion
    @visualizacion_id INT,
    @puntuacion DECIMAL(3,1)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Verificar si ya existe una calificación para esta visualización
        IF EXISTS (SELECT 1 FROM Calificaciones WHERE visualizacion_id = @visualizacion_id)
        BEGIN
            -- Actualizar calificación existente
            UPDATE Calificaciones
            SET puntuacion = @puntuacion,
                fecha_actualizacion = GETDATE()
            WHERE visualizacion_id = @visualizacion_id;
            
            SELECT 'Calificación actualizada exitosamente' AS Mensaje;
        END
        ELSE
        BEGIN
            -- Insertar nueva calificación
            INSERT INTO Calificaciones (visualizacion_id, puntuacion)
            VALUES (@visualizacion_id, @puntuacion);
            
            SELECT 'Calificación agregada exitosamente' AS Mensaje;
        END
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        SELECT 'Error al agregar calificación: ' + @ErrorMessage AS Mensaje;
    END CATCH
END;
GO

-- =============================================
-- TRIGGERS PARA MANTENER INTEGRIDAD
-- =============================================

-- Trigger para actualizar fecha_actualizacion en Visualizaciones
CREATE TRIGGER trg_ActualizarFechaVisualizacion
ON Visualizaciones
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Visualizaciones
    SET fecha_actualizacion = GETDATE()
    FROM Visualizaciones v
    INNER JOIN inserted i ON v.visualizacion_id = i.visualizacion_id;
END;
GO

-- =============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- =============================================
/*
-- Insertar usuario de ejemplo (en producción, usaría un hash de contraseña)
INSERT INTO Usuarios (usuario_nombre, usuario_contrasena_hash, usuario_edad)
VALUES ('usuario_ejemplo', 'hash_de_contrasena_segura', 25);

-- Ejemplo de cómo se registrarían contenidos (IDs ficticios de TMDB)
EXEC sp_RegistrarVisualizacion 1, 12345, 1, 'Inception';
EXEC sp_RegistrarVisualizacion 1, 67890, 2, 'Breaking Bad';

-- Agregar calificaciones
EXEC sp_AgregarCalificacion 1, 9.5;
*/
GO

-- =============================================
-- FUNCIONES ADICIONALES
-- =============================================

-- Función para obtener estadísticas de usuario
CREATE FUNCTION fn_EstadisticasUsuario(@usuario_id INT)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        COUNT(DISTINCT v.contenido_id) AS total_contenidos_vistos,
        COUNT(DISTINCT CASE WHEN tc.tipo_id = 1 THEN v.contenido_id END) AS total_peliculas,
        COUNT(DISTINCT CASE WHEN tc.tipo_id = 2 THEN v.contenido_id END) AS total_series,
        AVG(cal.puntuacion) AS promedio_calificacion,
        MIN(v.fecha_visualizacion) AS primera_visualizacion,
        MAX(v.fecha_visualizacion) AS ultima_visualizacion
    FROM Visualizaciones v
    INNER JOIN TiposContenido tc ON v.tipo_id = tc.tipo_id
    LEFT JOIN Calificaciones cal ON v.visualizacion_id = cal.visualizacion_id
    WHERE v.usuario_id = @usuario_id
);
GO

-- =============================================
-- SEGURIDAD: ROLES Y PERMISOS
-- =============================================

-- Crear rol para usuarios de la aplicación
CREATE ROLE app_user;
GO

-- Conceder permisos básicos al rol
GRANT SELECT, INSERT, UPDATE ON Usuarios TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON Visualizaciones TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON Calificaciones TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON Reseñas TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON EpisodiosVistos TO app_user;
GRANT SELECT ON TiposContenido TO app_user;
GRANT SELECT ON ContenidosTMDB TO app_user;
GRANT SELECT ON EstadosVisualizacion TO app_user;
GRANT EXECUTE ON sp_RegistrarVisualizacion TO app_user;
GRANT EXECUTE ON sp_AgregarCalificacion TO app_user;
GRANT SELECT ON VistaHistorialUsuario TO app_user;
GRANT SELECT ON VistaTopCalificaciones TO app_user;
GO

PRINT 'Base de datos creada exitosamente.';
PRINT 'Recuerda:';
PRINT '1. En producción, siempre usa hashes seguros para contraseñas (bcrypt, Argon2, etc.)';
PRINT '2. Los IDs de TMDB se almacenan en la tabla ContenidosTMDB';
PRINT '3. Considera implementar un sistema de sincronización con la API de TMDB';
PRINT '4. Configura backups regulares de la base de datos';