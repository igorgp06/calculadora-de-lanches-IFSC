$(document).ready(function () {
    const cupons = {
        LANCHE10: 0.10,
        LANCHE20: 0.20
    };

    let percentualCupomAplicado = 0;

    const formatarMoeda = (valor) => {
        return "R$ " + valor.toFixed(2).replace(".", ",");
    };

    const lerQuantidade = () => {
        return Math.max(1, parseInt($("#input-qtd").val()) || 1);
    };

    const calcularTotal = () => {
        const precoLanche = parseFloat($("#select-lanche").val()) || 0;

        let somaAdicionais = 0;
        $(".check-adicional:checked").each(function () {
            somaAdicionais += parseFloat($(this).val()) || 0;
        });

        const quantidade = lerQuantidade();
        const subtotal = (precoLanche + somaAdicionais) * quantidade;
        const desconto = subtotal * percentualCupomAplicado;
        const taxaEntrega = parseFloat($("#select-entrega").val()) || 0;
        const totalGeral = subtotal - desconto + taxaEntrega;

        $("#valor-subtotal").text(formatarMoeda(subtotal));
        $("#valor-taxa-entrega").text(formatarMoeda(taxaEntrega));
        $("#valor-desconto").text("- " + formatarMoeda(desconto));
        $("#total-geral").text(formatarMoeda(totalGeral));
    };

    $("#select-lanche, #select-entrega, .check-adicional").on("change", calcularTotal);
    $("#input-qtd").on("input", calcularTotal);
    $("#input-qtd").on("change", () => {
        $("#input-qtd").val(lerQuantidade());
        calcularTotal();
    });

    $("#btn-aplicar-cupom").on("click", () => {
        const codigoCupom = $("#input-cupom").val().trim().toUpperCase();
        percentualCupomAplicado = cupons[codigoCupom] || 0;

        if (codigoCupom && percentualCupomAplicado > 0) {
            $("#feedback-cupom")
                .removeClass("text-danger")
                .addClass("text-success")
                .text(`Cupom aplicado: ${percentualCupomAplicado * 100}% de desconto`);
        } else if (codigoCupom) {
            $("#feedback-cupom")
                .removeClass("text-success")
                .addClass("text-danger")
                .text("Cupom inválido");
        } else {
            $("#feedback-cupom").removeClass("text-success text-danger").text("");
        }

        calcularTotal();
    });

    $("#btn-aumentar").on("click", () => {
        $("#input-qtd").val(lerQuantidade() + 1).trigger("change");
    });

    $("#btn-diminuir").on("click", () => {
        $("#input-qtd").val(Math.max(1, lerQuantidade() - 1)).trigger("change");
    });

    $("#btn-limpar").on("click", () => {
        $("#select-lanche").val("0");
        $(".check-adicional").prop("checked", false);
        $("#input-qtd").val(1);
        $("#select-entrega").val("0.00");
        $("#input-cupom").val("");
        $("#feedback-cupom").removeClass("text-success text-danger").text("");
        percentualCupomAplicado = 0;

        localStorage.removeItem("rascunho_pedido");
        calcularTotal();
    });

    $("#btn-finalizar").on("click", () => {
        const pedido = {
            lanche: $("#select-lanche").val(),
            qtd: lerQuantidade(),
            entrega: $("#select-entrega").val(),
            adicionais: $(".check-adicional:checked").map(function () {
                return this.id;
            }).get(),
            cupom: $("#input-cupom").val()
        };

        localStorage.setItem("rascunho_pedido", JSON.stringify(pedido));
        alert("Pedido salvo no navegador!");
    });

    const lerRascunho = () => {
        try {
            return JSON.parse(localStorage.getItem("rascunho_pedido"));
        } catch {
            return null;
        }
    };

    const restaurarRascunho = () => {
        const pedido = lerRascunho();

        if (!pedido) {
            calcularTotal();
            return;
        }

        $("#select-lanche").val(pedido.lanche);
        $("#input-qtd").val(pedido.qtd);
        $("#select-entrega").val(pedido.entrega);
        $("#input-cupom").val(pedido.cupom);

        (pedido.adicionais || []).forEach((id) => {
            $("#" + id).prop("checked", true);
        });

        if (pedido.cupom) {
            $("#btn-aplicar-cupom").trigger("click");
        } else {
            calcularTotal();
        }
    };

    restaurarRascunho();
});
