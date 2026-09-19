
document.addEventListener("DOMContentLoaded", () => {

    const formSolicitud = document.getElementById("formSolicitud");
    const btnAgregarProducto = document.getElementById("btnAgregarProducto");
    const productosContainer = document.getElementById("productosContainer");
    const mensajeSolicitud = document.getElementById("mensajeSolicitud");
    const btnPublicar = document.getElementById("btnPublicar");

    if (!formSolicitud) {
        return;
    }


    // ============================================
    // AGREGAR PRODUCTO
    // ============================================

    btnAgregarProducto.addEventListener("click", () => {

        const cantidadProductos =
            productosContainer.querySelectorAll(".producto-item").length;

        const numeroProducto = cantidadProductos + 1;


        const nuevoProducto = document.createElement("div");

        nuevoProducto.classList.add(
            "producto-item",
            "card",
            "bg-light",
            "border",
            "mb-3"
        );


        nuevoProducto.innerHTML = `

            <div class="card-body">

                <div class="d-flex justify-content-between align-items-center mb-3">

                    <h6 class="fw-bold mb-0">
                        Producto #${numeroProducto}
                    </h6>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger btnEliminarProducto"
                    >
                        <i class="bi bi-trash"></i>
                        Eliminar
                    </button>

                </div>


                <div class="row">

                    <div class="col-md-4 mb-3">

                        <label class="form-label">
                            Categoría
                        </label>

                        <select
                            class="form-select"
                            name="id_categoria[]"
                            required
                        >

                            <option value="" selected disabled>
                                Selecciona una categoría
                            </option>

                            <option value="1">
                                Víveres básicos
                            </option>

                            <option value="2">
                                Alimentos infantiles
                            </option>

                            <option value="3">
                                Agua potable
                            </option>

                            <option value="4">
                                Frutas y verduras
                            </option>

                            <option value="5">
                                Alimentos no perecederos
                            </option>

                            <option value="6">
                                Otro
                            </option>

                        </select>

                    </div>


                    <div class="col-md-4 mb-3">

                        <label class="form-label">
                            Producto
                        </label>

                        <input
                            type="text"
                            class="form-control"
                            name="producto[]"
                            maxlength="150"
                            placeholder="Ej. Arroz"
                            required
                        >

                    </div>


                    <div class="col-md-4 mb-3">

                        <label class="form-label">
                            Cantidad requerida
                        </label>

                        <input
                            type="text"
                            class="form-control"
                            name="cantidad_requerida[]"
                            maxlength="100"
                            placeholder="Ej. 20 libras"
                            required
                        >

                    </div>

                </div>

            </div>
        `;


        productosContainer.appendChild(nuevoProducto);

        actualizarNumeracion();

    });


    // ============================================
    // ELIMINAR PRODUCTO
    // ============================================

    productosContainer.addEventListener("click", (event) => {

        const botonEliminar =
            event.target.closest(".btnEliminarProducto");

        if (!botonEliminar) {
            return;
        }

        const productos =
            productosContainer.querySelectorAll(".producto-item");


        // Evitar que el usuario elimine el último producto
        if (productos.length <= 1) {

            mostrarMensaje(
                "Debes tener al menos un producto en la solicitud.",
                "danger"
            );

            return;
        }


        const producto =
            botonEliminar.closest(".producto-item");

        producto.remove();

        actualizarNumeracion();

    });


    // ============================================
    // ACTUALIZAR NUMERACIÓN
    // ============================================

    function actualizarNumeracion() {

        const productos =
            productosContainer.querySelectorAll(".producto-item");


        productos.forEach((producto, index) => {

            const titulo =
                producto.querySelector("h6");

            if (titulo) {
                titulo.textContent =
                    `Producto #${index + 1}`;
            }

        });

    }


    // ============================================
    // ENVIAR FORMULARIO
    // ============================================

    formSolicitud.addEventListener("submit", async (event) => {

        event.preventDefault();


        // Limpiar mensaje anterior
        ocultarMensaje();


        // Desactivar botón
        btnPublicar.disabled = true;

        btnPublicar.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-2"
                role="status"
            ></span>
            Publicando...
        `;


        try {

            const formData =
                new FormData(formSolicitud);


            const respuesta = await fetch(
                "../solicitudes/crear.php",
                {
                    method: "POST",
                    body: formData,
                    credentials: "include"
                }
            );


            const datos = await respuesta.json();


            if (datos.status === "success") {

                mostrarMensaje(
                    datos.message,
                    "success"
                );


                // Limpiar formulario
                formSolicitud.reset();


                // Dejar solamente un producto
                const productos =
                    productosContainer.querySelectorAll(".producto-item");


                productos.forEach((producto, index) => {

                    if (index > 0) {
                        producto.remove();
                    }

                });


                actualizarNumeracion();


            } else {

                mostrarMensaje(
                    datos.message ||
                    "No se pudo crear la solicitud.",
                    "danger"
                );

            }


        } catch (error) {

            console.error(error);

            mostrarMensaje(
                "No se pudo conectar con el servidor.",
                "danger"
            );

        } finally {

            btnPublicar.disabled = false;

            btnPublicar.innerHTML = `
                <i class="bi bi-send me-2"></i>
                Publicar solicitud
            `;

        }

    });


    // ============================================
    // MOSTRAR MENSAJE
    // ============================================

    function mostrarMensaje(texto, tipo) {

        mensajeSolicitud.className =
            `alert alert-${tipo}`;

        mensajeSolicitud.textContent = texto;

        mensajeSolicitud.classList.remove("d-none");

        mensajeSolicitud.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }


    // ============================================
    // OCULTAR MENSAJE
    // ============================================

    function ocultarMensaje() {

        mensajeSolicitud.classList.add("d-none");

        mensajeSolicitud.textContent = "";

    }

});

