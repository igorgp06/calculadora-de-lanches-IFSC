$(document).ready(function () {
    let desconto = 0;

    function moeda(valor) {
        return 'R$ ' + valor.toFixed(2).replace('.', ',');
    }

    function calcular() {
        const precoLanche = parseFloat($('#select-lanche').val()) || 0;
        const quantidade = Math.max(1, parseInt($('#input-qtd').val()) || 1);
        const entrega = parseFloat($('#select-entrega').val()) || 0;
        let adicionais = 0;

        $('#input-qtd').val(quantidade);

        $('.check-adicional:checked').each(function () {
            adicionais += parseFloat($(this).val()) || 0;
        });

        const subtotal = (precoLanche + adicionais) * quantidade;
        const valorDesconto = subtotal * desconto;
        const total = subtotal + entrega - valorDesconto;

        $('#valor-subtotal').text(moeda(subtotal));
        $('#valor-taxa-entrega').text(moeda(entrega));
        $('#valor-desconto').text('- ' + moeda(valorDesconto));
        $('#total-geral').text(moeda(total));

        atualizarResumo(precoLanche, quantidade);
    }

    function atualizarResumo(precoLanche, quantidade) {
        if (precoLanche === 0) {
            $('#resumo-itens').html(`
                <div class="estado-vazio text-center py-4">
                    <i class="bi bi-basket3"></i>
                    <p class="mb-0 mt-2">Seu pedido ainda está vazio.</p>
                    <small>Selecione um lanche para começar.</small>
                </div>
            `);
            return;
        }

        const nome = $('#select-lanche option:selected').text().split(' — ')[0];
        let html = `<div class="resumo-item"><span>${nome}<small>${quantidade} unidade(s)</small></span></div>`;

        $('.check-adicional:checked').each(function () {
            const adicional = $(this).closest('.adicional-item').find('strong').first().text();
            html += `<div class="resumo-item"><span>+ ${adicional}</span></div>`;
        });

        $('#resumo-itens').html(html);
    }

    function aplicarCupom() {
        const cupom = $('#input-cupom').val().trim().toUpperCase();
        const feedback = $('#feedback-cupom');

        desconto = cupom === 'LANCHE10' ? 0.10 : 0;
        feedback.removeClass('feedback-sucesso feedback-erro');

        if (cupom === 'LANCHE10') {
            feedback.addClass('feedback-sucesso').text('Cupom aplicado: 10% de desconto!');
        } else if (cupom !== '') {
            feedback.addClass('feedback-erro').text('Cupom inválido.');
        }

        calcular();
    }

    function salvar() {
        const pedido = {
            lanche: $('#select-lanche').val(),
            quantidade: $('#input-qtd').val(),
            entrega: $('#select-entrega').val()
        };

        localStorage.setItem('pedido', JSON.stringify(pedido));
    }

    function restaurar() {
        const salvo = JSON.parse(localStorage.getItem('pedido'));
        if (!salvo) return calcular();

        $('#select-lanche').val(salvo.lanche);
        $('#input-qtd').val(salvo.quantidade);
        $('#select-entrega').val(salvo.entrega);
        calcular();
    }

    $('#select-lanche, #select-entrega, .check-adicional, #input-qtd').on('change input', calcular);

    $('#btn-aumentar').on('click', function () {
        $('#input-qtd').val((parseInt($('#input-qtd').val()) || 1) + 1);
        calcular();
    });

    $('#btn-diminuir').on('click', function () {
        const qtd = Math.max(1, (parseInt($('#input-qtd').val()) || 1) - 1);
        $('#input-qtd').val(qtd);
        calcular();
    });

    $('#btn-aplicar-cupom').on('click', aplicarCupom);

    $('#btn-finalizar').on('click', function () {
        if ($('#select-lanche').val() === '0') return alert('Selecione um lanche.');
        salvar();
        bootstrap.Toast.getOrCreateInstance(document.getElementById('toast-pedido')).show();
    });

    $('#btn-limpar').on('click', function () {
        $('#select-lanche').val('0');
        $('.check-adicional').prop('checked', false);
        $('#input-qtd').val('1');
        $('#select-entrega').val('0.00');
        $('#input-cupom').val('');
        $('#feedback-cupom').removeClass('feedback-sucesso feedback-erro').html('Teste o cupom <strong>LANCHE10</strong> para 10% de desconto.');
        desconto = 0;
        localStorage.removeItem('pedido');
        calcular();
    });

    restaurar();
});
