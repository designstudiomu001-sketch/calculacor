from flask import Flask, render_template, request, jsonify
import math

app = Flask(__name__)

@app.route('/')
def index():
    """Menampilkan halaman utama kalkulator"""
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    """Endpoint untuk melakukan perhitungan"""
    try:
        data = request.get_json()
        expression = data.get('expression', '')
        
        # Validasi input
        if not expression:
            return jsonify({'result': 'Error', 'message': 'Ekspresi kosong'})
        
        # Keamanan: Hanya izinkan karakter yang aman untuk kalkulator
        allowed_chars = '0123456789+-*/().%^ '
        if not all(c in allowed_chars for c in expression):
            return jsonify({'result': 'Error', 'message': 'Karakter tidak valid'})
        
        # Debug: print expression yang diterima
        print(f"Expression received: {expression}")
        
        # Ganti simbol ^ dengan ** untuk perpangkatan
        expression = expression.replace('^', '**')
        
        # PERBAIKI: Penanganan persentase yang lebih baik
        # Contoh: 50% menjadi 50/100
        import re
        # Temukan pola angka diikuti %
        expression = re.sub(r'(\d+(\.\d+)?)%', r'(\1/100)', expression)
        
        # Evaluasi ekspresi matematika
        result = eval(expression)
        
        # Format hasil
        if isinstance(result, float):
            # Bulatkan jika perlu
            if result.is_integer():
                result = int(result)
            else:
                # Bulatkan ke 10 digit desimal
                result = round(result, 10)
        
        print(f"Result: {result}")
        return jsonify({
            'result': str(result),
            'message': 'Berhasil'
        })
        
    except ZeroDivisionError:
        return jsonify({'result': 'Error', 'message': 'Tidak bisa membagi dengan nol'})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'result': 'Error', 'message': f'Ekspresi tidak valid: {str(e)}'})
        

        
    except ZeroDivisionError:
        return jsonify({'result': 'Error', 'message': 'Tidak bisa membagi dengan nol'})
    except Exception as e:
        return jsonify({'result': 'Error', 'message': f'Ekspresi tidak valid: {str(e)}'})

@app.route('/advanced', methods=['POST'])
def advanced_calculation():
    """Endpoint untuk perhitungan lanjutan"""
    try:
        data = request.get_json()
        operation = data.get('operation', '')
        value = float(data.get('value', 0))
        
        if operation == 'sqrt':
            if value < 0:
                return jsonify({'result': 'Error', 'message': 'Akar kuadrat tidak bisa negatif'})
            result = math.sqrt(value)
        elif operation == 'square':
            result = value ** 2
        elif operation == 'sin':
            result = math.sin(math.radians(value))
        elif operation == 'cos':
            result = math.cos(math.radians(value))
        elif operation == 'tan':
            result = math.tan(math.radians(value))
        elif operation == 'log':
            if value <= 0:
                return jsonify({'result': 'Error', 'message': 'Logaritma harus lebih dari 0'})
            result = math.log10(value)
        elif operation == 'ln':
            if value <= 0:
                return jsonify({'result': 'Error', 'message': 'Logaritma natural harus lebih dari 0'})
            result = math.log(value)
        else:
            return jsonify({'result': 'Error', 'message': 'Operasi tidak dikenal'})
        
        # Format hasil
        if isinstance(result, float) and abs(result) < 1e-10:
            result = 0
        
        return jsonify({
            'result': str(round(result, 10)),
            'message': 'Berhasil'
        })
        
    except Exception as e:
        return jsonify({'result': 'Error', 'message': f'Terjadi kesalahan: {str(e)}'})

if __name__ == '__main__':
    app.run(debug=True, port=6969)