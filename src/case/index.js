var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var md5 = require('md5');

const params_fn = '.params';
const body_fn = '.body';
const attachments_fld = '.att';
const attchments_texts_fld = '.att_text';

class Case
{
    constructor()
    {
        this.channel = 'undefined';
        this.agent = 'undefined';
		this.id = crypto.randomBytes(48).toString('hex');
    }

    static load(in_Path)
    {

    }

    getField(in_Field)
    {
		let val = this[in_Field];
        if (val !== undefined)
            return val;
        if (in_Field === 'body')
            return fs.readFileSync(path.join(this._folder, body_fn), 'utf8');
        return undefined;
    }

    pushRule(in_Rule)
    {
        this.rules.push(in_Rule);
        storeParams();
    }

	isRulePresent(in_Rule)
	{
		return this.rules.indexOf(in_Rule) !== -1;
	}

    storeParams()
    {
        fs.writeFile(path.join(this._folder, params_fn), JSON.stringify(this, '\t'), 'utf8');
    }

	getParams()
	{
		
	}


    setParams(in_Params)
    {
        Object.assign(this, in_Params);
        this.storeParams();
    } 

    setFolder(in_Folder)
    {
        this._folder = in_Folder;
        if (!fs.existsSync(this._folder))
            fs.mkdirSync(this._folder);
    }

    setBody(in_String, in_Callback)
    {
        fs.writeFile(path.join(this._folder, body_fn), in_String, 'utf8', in_Callback);
    }

	getEncodedBody(in_Encoding, in_Callback)
    {
        fs.readFile(path.join(this._folder, body_fn), in_Encoding, in_Callback);
    }

    getBody(in_Callback)
    {
        fs.readFile(path.join(this._folder, body_fn), in_Callback);
    }


	calcMD5()
	{
		let buf = JSON.stringify(this);
		return md5(buf);
	}

	

	getBodyStream()
	{
		return fs.createReadStream(path.join(this._folder, body_fn));
	}

    pushAttachment(in_Path, in_Filename, in_Callback)
    {
        this.ensureFolder(path.join(this._folder, attachments_fld), (err) =>
        {
            if (err)
                return in_Callback(err);
            fs.writeFile(path.join(this._folder, attachments_fld, in_Filename), fs.createReadStream(in_Path), in_Callback);
        });
    }

    ensureFolder(in_Path, in_Callback)
    {
        fs.exists(in_Path, (exists) => { exists ? in_Callback(null) : fs.mkdir(in_Path, in_Callback)});
    }
};


module.exports = Case;