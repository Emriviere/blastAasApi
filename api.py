from flask import Flask, request, redirect, url_for, jsonify, Response,abort,render_template
from werkzeug.utils import secure_filename
from Bio.Blast.Applications import NcbiblastpCommandline
from Bio.Blast.Applications import NcbiblastnCommandline

import os
import subprocess
import random
import re

UPLOAD_FOLDER = '/home/blast/blastAasFiles/uploadedFiles/'
TMP_QUERY_FOLDER = '/home/blast/blastAasFiles/tmpQueryFiles/'
TMP_RESULT_FOLDER = '/home/blast/blastAasFiles/tmpResult/'

ALLOWED_EXTENSIONS = set(['pep','fasta','txt'])


app = Flask(__name__)
#app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

@app.route('/')
def hello():
    return render_template('blastAas.html')

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return redirect(request.url)
    file = request.files['file']
    # if user does not select file, browser also
    # submit a empty part without filename
    if file.filename == '':
        #flash('No selected file')
        return redirect(request.url)
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        return jsonify(Upload='ok')

@app.route('/files', methods=['GET'])
def list_files():
    lst = dict()
    lst['files'] = []
    for file in os.listdir(UPLOAD_FOLDER):
        if file.endswith(".pep") or file.endswith(".fasta") or file.endswith(".txt"):
        	print(os.path.join(UPLOAD_FOLDER, file))
	        lst['files'].append(file)
    return jsonify(lst)

@app.route('/blastp/analyze', methods=['GET'])
def blastp_analyze():
    tmpFileName = TMP_QUERY_FOLDER+"query-"+str(random.randint(1,99999))
    tmpFile = open(tmpFileName,"w") 	
    tmpFile.write(request.args.get('query'))
    tmpFile.close()
    query = tmpFileName
    db = UPLOAD_FOLDER+request.args.get('db')
    result_file='tmp_res'
    outFormat = request.args.get('outputFormat')
    blastx_cline = NcbiblastpCommandline(query=query, db=db, evalue=50.0,outfmt=outFormat, out=TMP_RESULT_FOLDER+result_file, matrix="PAM30")
    stdout, stderr = blastx_cline()
    #f = open(TMP_RESULT_FOLDER+result_file ,'r')
    result = ""
    with open(TMP_RESULT_FOLDER+result_file) as f:
        for line in f:
            #if(outFormat==7):
            #    words=line.split()
            #    result = result+'<tr>'
            #    for c in words:
            #        result = result +'<td>'+c+'</td>'
            #    result = result+'</tr>'								                                
            #else:
            result = result + line
    f.close()
    os.remove(tmpFileName)
    return result

@app.route('/blastn/analyze', methods=['GET'])
def blastn_analyze():
    tmpFileName = TMP_QUERY_FOLDER+"query-"+str(random.randint(1,99999))
    tmpFile = open(tmpFileName,"w")
    tmpFile.write(request.args.get('query'))
    tmpFile.close()
    query = tmpFileName
    db = UPLOAD_FOLDER+request.args.get('db')
    result_file='tmp_res'
    outFormat = request.args.get('outputFormat')
    blastx_cline = NcbiblastnCommandline(query=query, db=db, evalue=50.0,outfmt=outFormat, out=TMP_RESULT_FOLDER+result_file)
    stdout, stderr = blastx_cline()
    #f = open(TMP_RESULT_FOLDER+result_file ,'r')
    result = ""
    with open(TMP_RESULT_FOLDER+result_file) as f:
        for line in f:
            #if(outFormat==7):
            #    words=line.split()
            #    result = result+'<tr>'
            #    for c in words:
            #        result = result +'<td>'+c+'</td>'
            #    result = result+'</tr>'
            #else:
            result = result + line
    f.close()
    os.remove(tmpFileName)
    return result


@app.route('/createblastdb', methods=['POST'])
def create_blast_db():
    db = UPLOAD_FOLDER+request.args.get('db')
    cmd = 'makeblastdb -in '+db+' -dbtype nucl'
    process = subprocess.Popen(cmd,stdout=subprocess.PIPE, shell=True)
    (output, err) = process.communicate()
    print(str(output))
    return jsonify(output=str(output),error=str(err))


@app.before_request
def before_request():
    print("Remote addr : "+request.remote_addr)

@app.after_request
def apply_caching(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers['Server'] = 'GNU/Linux'
    return response


if __name__ == '__main__':
    app.run(
        debug=True,
        port=80,
        host="0.0.0.0",
        threaded=True
    )

