<?php
// auth/logout.php

session_start();

// Destruir todos los datos de la sesión
$_SESSION = [];
session_destroy();

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'status' => 'success',
    'message' => 'Sesión cerrada correctamente.'
]);
?>