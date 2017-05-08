var fs = require('fs');
var path = require('path');

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
        this.id  = 0;// TODO: Сгенерировать новый id
    }

    static load(in_Path)
    {

    }

    getField(in_Field)
    {
        if (this[in_Field] !== undefined)
            return in_Field;
        if (in_Field === 'body')
            return fs.readFileSync(path.join(this._folder, body_fn));
        return undefined;
    }

    pushRule(in_Rule)
    {
        this.rules.push(in_Rule);
        storeParams();
    }

    storeParams()
    {
        fs.writeFile(path.join(this._folder, params_fn), JSON.stringify(this, '\t'), 'utf8');
    }


    setParams(in_Params)
    {
        Object.assign(this, in_Params);
        storeParams();
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

    getBody(in_Callback)
    {
        fs.readFile(path.join(this._folder, body_fn), in_Callback);
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