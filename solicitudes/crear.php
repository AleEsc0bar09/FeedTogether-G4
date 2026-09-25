
<?php

// solicitudes/crear.php

session_start();

header('Content-Type: application/json; charset=utf-8');

require_once '../config/conexion.php';


// =====================================================
// 1. VERIFICAR MÉTODO
// =====================================================

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    http_response_code(405);

    echo json_encode([
        'status' => 'error',
        'message' => 'Método no permitido.'
    ]);

    exit;
}


// =====================================================
// 2. VERIFICAR SESIÓN
// =====================================================

if (!isset($_SESSION['usuario_id'])) {

    http_response_code(401);

    echo json_encode([
        'status' => 'error',
        'message' => 'Debes iniciar sesión para crear una solicitud.'
    ]);

    exit;
}


$idUsuario = (int) $_SESSION['usuario_id'];


// =====================================================
// 3. OBTENER DATOS
// =====================================================

$titulo = trim($_POST['titulo'] ?? '');

$descripcion = trim($_POST['descripcion'] ?? '');

$cantidadBeneficiados =
    trim($_POST['cantidad_beneficiados'] ?? '');

$ubicacion =
    trim($_POST['ubicacion'] ?? '');

$fechaLimite =
    trim($_POST['fecha_limite'] ?? '');


// Productos
$categorias =
    $_POST['id_categoria'] ?? [];

$productos =
    $_POST['producto'] ?? [];

$cantidades =
    $_POST['cantidad_requerida'] ?? [];


// =====================================================
// 4. VALIDAR CAMPOS PRINCIPALES
// =====================================================

if ($titulo === '') {

    echo json_encode([
        'status' => 'error',
        'message' => 'El título es obligatorio.'
    ]);

    exit;
}


if ($descripcion === '') {

    echo json_encode([
        'status' => 'error',
        'message' => 'La descripción es obligatoria.'
    ]);

    exit;
}


if (strlen($titulo) > 150) {

    echo json_encode([
        'status' => 'error',
        'message' => 'El título no puede superar los 150 caracteres.'
    ]);

    exit;
}


if ($cantidadBeneficiados !== '') {

    if (
        !filter_var(
            $cantidadBeneficiados,
            FILTER_VALIDATE_INT
        ) ||
        (int)$cantidadBeneficiados < 1
    ) {

        echo json_encode([
            'status' => 'error',
            'message' => 'La cantidad de beneficiados no es válida.'
        ]);

        exit;
    }

    $cantidadBeneficiados =
        (int)$cantidadBeneficiados;

} else {

    $cantidadBeneficiados = null;
}


// =====================================================
// 5. VALIDAR FECHA
// =====================================================

if ($fechaLimite !== '') {

    $fecha = DateTime::createFromFormat(
        'Y-m-d',
        $fechaLimite
    );

    if (
        !$fecha ||
        $fecha->format('Y-m-d') !== $fechaLimite
    ) {

        echo json_encode([
            'status' => 'error',
            'message' => 'La fecha límite no es válida.'
        ]);

        exit;
    }

} else {

    $fechaLimite = null;
}


// =====================================================
// 6. VALIDAR PRODUCTOS
// =====================================================

if (
    !is_array($categorias) ||
    !is_array($productos) ||
    !is_array($cantidades)
) {

    echo json_encode([
        'status' => 'error',
        'message' => 'Los datos de los productos no son válidos.'
    ]);

    exit;
}


$totalProductos = count($productos);


if ($totalProductos < 1) {

    echo json_encode([
        'status' => 'error',
        'message' => 'Debes agregar al menos un producto.'
    ]);

    exit;
}


if (
    count($categorias) !== $totalProductos ||
    count($cantidades) !== $totalProductos
) {

    echo json_encode([
        'status' => 'error',
        'message' => 'Los datos de los productos están incompletos.'
    ]);

    exit;
}


// =====================================================
// 7. VALIDAR CADA PRODUCTO
// =====================================================

$categoriasValidas = [1, 2, 3, 4, 5, 6];


for ($i = 0; $i < $totalProductos; $i++) {

    $categoria =
        (int)$categorias[$i];

    $producto =
        trim($productos[$i]);

    $cantidad =
        trim($cantidades[$i]);


    if (!in_array($categoria, $categoriasValidas, true)) {

        echo json_encode([
            'status' => 'error',
            'message' => 'Una de las categorías seleccionadas no es válida.'
        ]);

        exit;
    }


    if ($producto === '') {

        echo json_encode([
            'status' => 'error',
            'message' => 'Todos los productos deben tener un nombre.'
        ]);

        exit;
    }


    if ($cantidad === '') {

        echo json_encode([
            'status' => 'error',
            'message' => 'Todos los productos deben tener una cantidad.'
        ]);

        exit;
    }


    if (strlen($producto) > 150) {

        echo json_encode([
            'status' => 'error',
            'message' => 'El nombre de un producto supera los 150 caracteres.'
        ]);

        exit;
    }


    if (strlen($cantidad) > 100) {

        echo json_encode([
            'status' => 'error',
            'message' => 'Una cantidad supera los 100 caracteres.'
        ]);

        exit;
    }
}


// =====================================================
// 8. VALIDAR IMAGEN
// =====================================================

$imagenExiste = false;

if (
    isset($_FILES['imagen']) &&
    $_FILES['imagen']['error'] !== UPLOAD_ERR_NO_FILE
) {

    if ($_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {

        echo json_encode([
            'status' => 'error',
            'message' => 'Ocurrió un error al subir la imagen.'
        ]);

        exit;
    }


    $imagenExiste = true;


    // Máximo 5 MB
    if ($_FILES['imagen']['size'] > 5 * 1024 * 1024) {

        echo json_encode([
            'status' => 'error',
            'message' => 'La imagen no puede superar los 5 MB.'
        ]);

        exit;
    }


    // Validar MIME real
    $finfo = new finfo(FILEINFO_MIME_TYPE);

    $tipoImagen =
        $finfo->file($_FILES['imagen']['tmp_name']);


    $tiposPermitidos = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp'
    ];


    if (!isset($tiposPermitidos[$tipoImagen])) {

        echo json_encode([
            'status' => 'error',
            'message' => 'El archivo debe ser JPG, PNG o WEBP.'
        ]);

        exit;
    }


    $extension =
        $tiposPermitidos[$tipoImagen];

}


// =====================================================
// 9. INICIAR TRANSACCIÓN
// =====================================================

try {

    $conexion->beginTransaction();


    // =================================================
    // 10. INSERTAR SOLICITUD
    // =================================================

    $sqlSolicitud = "
        INSERT INTO solicitudes
        (
            id_usuario,
            titulo,
            descripcion,
            cantidad_beneficiados,
            ubicacion,
            fecha_limite
        )
        VALUES
        (
            :id_usuario,
            :titulo,
            :descripcion,
            :cantidad_beneficiados,
            :ubicacion,
            :fecha_limite
        )
    ";


    $stmtSolicitud =
        $conexion->prepare($sqlSolicitud);


    $stmtSolicitud->execute([

        ':id_usuario' =>
            $idUsuario,

        ':titulo' =>
            $titulo,

        ':descripcion' =>
            $descripcion,

        ':cantidad_beneficiados' =>
            $cantidadBeneficiados,

        ':ubicacion' =>
            $ubicacion !== ''
                ? $ubicacion
                : null,

        ':fecha_limite' =>
            $fechaLimite

    ]);


    // Obtener ID de la solicitud
    $idSolicitud =
        $conexion->lastInsertId();


    // =================================================
    // 11. INSERTAR DETALLES
    // =================================================

    $sqlDetalle = "
        INSERT INTO detalles_solicitud
        (
            id_solicitud,
            id_categoria,
            producto,
            cantidad_requerida
        )
        VALUES
        (
            :id_solicitud,
            :id_categoria,
            :producto,
            :cantidad_requerida
        )
    ";


    $stmtDetalle =
        $conexion->prepare($sqlDetalle);


    for ($i = 0; $i < $totalProductos; $i++) {

        $stmtDetalle->execute([

            ':id_solicitud' =>
                $idSolicitud,

            ':id_categoria' =>
                (int)$categorias[$i],

            ':producto' =>
                trim($productos[$i]),

            ':cantidad_requerida' =>
                trim($cantidades[$i])

        ]);

    }


    // =================================================
    // 12. GUARDAR IMAGEN
    // =================================================

    if ($imagenExiste) {

        $carpetaDestino =
            '../public/uploads/solicitudes/';


        // Crear carpeta si no existe
        if (!is_dir($carpetaDestino)) {

            if (!mkdir(
                $carpetaDestino,
                0755,
                true
            )) {

                throw new Exception(
                    'No se pudo crear la carpeta de imágenes.'
                );
            }
        }


        $nombreArchivo =
            uniqid(
                'solicitud_',
                true
            ) . '.' . $extension;


        $rutaDestino =
            $carpetaDestino . $nombreArchivo;


        if (
            !move_uploaded_file(
                $_FILES['imagen']['tmp_name'],
                $rutaDestino
            )
        ) {

            throw new Exception(
                'No se pudo guardar la imagen.'
            );
        }


        // Guardar ruta en la BD
        $sqlImagen = "
            INSERT INTO imagen_solicitud
            (
                id_solicitud,
                ruta_imagen
            )
            VALUES
            (
                :id_solicitud,
                :ruta_imagen
            )
        ";


        $stmtImagen =
            $conexion->prepare($sqlImagen);


        $stmtImagen->execute([

            ':id_solicitud' =>
                $idSolicitud,

            ':ruta_imagen' =>
                'uploads/solicitudes/' . $nombreArchivo

        ]);

    }


    // =================================================
    // 13. CONFIRMAR TRANSACCIÓN
    // =================================================

    $conexion->commit();


    // =================================================
    // 14. RESPUESTA
    // =================================================

    echo json_encode([

        'status' =>
            'success',

        'message' =>
            '¡Solicitud publicada correctamente!',

        'id_solicitud' =>
            $idSolicitud

    ]);


} catch (Throwable $e) {


    // Deshacer cambios
    if ($conexion->inTransaction()) {

        $conexion->rollBack();

    }


    error_log(
        'Error al crear solicitud: ' .
        $e->getMessage()
    );


    http_response_code(500);


    echo json_encode([

        'status' =>
            'error',

        'message' =>
            'No se pudo crear la solicitud. Inténtalo nuevamente.'

    ]);

}

?>

