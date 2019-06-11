ProcessFlow
======

ProcessFlow is a general purpose IDE with a client-server architecture. It was initialy created for its `processflow` module,
whose purpose is to provide a general interface for easily managing flowcharts and generating code from them.

Requirements
------------
Python and flask must be installed.

On linux, it should look like this:
```
sudo apt-get install python python-dev
sudo apt-get install libffi-dev
sudo pip install flask flask_socketio flask-user
```

Is something missing or did you succeed to install it on other platforms ? Don't hesitate to contact us!

Installation
------------

Download the ZIP [here](https://github.com/mythesoft/processflow/archive/master.zip).

Unzip it and put it at a custom location.

Usage
-----

Launch the `server.py` script. On linux, it should look like this:

`python server.py`

It will launch a Flask server. Using Firefox / Chrome (IE compatibility not guaranteed), go to the following URL:

`http://localhost:5000`

Flowchart usage
---------------

Since this IDE was created for the flowchart editor, and only contains it for the moment, we will describe it here.
Please note that we plan to separate the flowchart editor from the IDE in the long run, that is why it has been
implemented in a different module.

The flowchart feature can be accessed by clicking on the `Flowchart` tab on the left.

This module is based on the [jquery.flowchart.js](https://github.com/sdrdis/jquery.flowchart) plugin and uses the same
[terminology](https://github.com/sdrdis/jquery.flowchart#terminology). Terms such as operators, links, connectors are
defined there.

We only need to define one additional term. A process is where you add all your operators, links, and define their
parameters.

Once you click on the `Flowchart` tab, multiple widgets will appear :
* The `Library` widget contains all common operators you can add to your process.
* The `Workspace` widget contains all operators and processes you created yourself.
* The central widget displays the current process. At the begining, no process is loaded.
* The widget on the right is the `Parameters` widgets and allows you to set various parameters to your operators and
links.

In order to grasp the user interface, here is what you should do if you are new to this:

1. Double click on the `My Project` folder.
2. Click on `Custom process`. The process should be displayed (see screenshot). The process contains three
operators ("Load file", "All fields", "Save to file"). That are connected between them.
3. You can move inside the process by dragging the mouse and you can zoom in / out using the scroll wheel.
4. You can move operators by dragging their titles.
5. Each operators can have inputs (on the left) and outputs (on the right). You can outputs by clicking on them and then
clicking on an input.
6. If you click on a link, the `Parameters` widget will allow you to change its color or delete it (you can also use
the backspace key for that).
7. If you click on the operators, the `Parameters` widget will allow you to change its title, delete it, and will also
display other parameters depending on the operator.
8. You can add new operators in the process by drag and dropping operators in the `Library` widget.

Technical documentation of the IDE
----------------------------------

This documentation is not up to par and we plan to improve it in the near term. If you can accelerate the process, don't
hesitate to contribute.

The main directory is comprised of 6 directories:
* `data`: this directory contains data about the user sessions. It is expected that the software will provide a user
management system where each user will have its own workspace, a username, a password... For the moment, only a "root"
user exists.
* `library`: this directory contains all the common modules. The Flowchart module is there.
* `static`: Javascript and CSS files allowing to manage the UI.
* `templates`: contains the main and only HTML file.
* `processflow`: this is the core directory.
* `workspaces`: this directory contains the workspaces of each user.

Currently, the core of the IDE is very similar to a web framework: it routes and dispatchs web requests to the modules.

Each folder inside the `library` repository is a module. Inside each module can be found:
* A `static` repository. If the module name (its folder name) is `custom_module`, then the file `static/file.txt` can be
accessed via the URL `http://localhost:5000/static/modules/custom_module/file.txt`.
* A `config.py` file. This is the module's configuration file. Three variable can be defined there:
  * `name`: Name of the module.
  * `main_js`: Javascript file to load in the browser when a new session starts.
  * `requirejs_paths`: Dictionnary to be added in the requirejs paths.
* A `main.py` file. This file handles web requests. See below.

### How web requests are handled

Since a lot of interactions can happen between the browser and the server, communications are handled using a web socket.

On the browser side, the object handling the websocket communication with the server can be loaded using requirejs under
the `app`. The function allowing to send a request is named `sendRequest`. Here is javascript code sending a custom
request:

```
define([
    'app',
], function( app ) {
    var data = {'key_1': 'data_1', 'key_2': 'data_2'};
    app.sendRequest('custom_request', data, function(response) {
        console.log(response);
    });
});
```

As you might have guessed, the first parameter is the request identifier (similar to an URL), the second is a hash
containing the request's data, and the third parameter is a callback method called when the server responds.

Once the request is sent to the server, processflow looks in all the modules `main.py` files for a method named
`on_custom_request` (where `custom_request` is the request identifier). If it exists, it calls the method with three parameters:
* `data`: data sent via the request
* `response`: dictionary that can be modified, it is the data that will be sent back by the server.
* `session_data`

Please note that this architecture allows multiple modules to handle the same request.

Here is how it could look like:
```
def on_custom_request(data, response, session_data):
    response['custom_variable_1'] = 1
    response['custom_variable_2'] = 2
```

See the `demo` module for a full demonstration.

### How to add a tab

See the `static/javascript/main.js` file in the `demo` module.

Technical documentation of the processflow module
----------------------------------------------

As explained earlier, processflow is the module handling the flowchart feature. We will address here the most important
things to know.

### How to add an operator in the library

The processflow module looks for the operators in all the modules. In each module, it checks if an `operators` folder exists,
if it does, it references all folders containing a `config.json`. Each folder constitutes an operator, and the
`config.json` contains its configuration. It is a dictionnary that looks like this:

```
{
    "id": "demo::load_file",
    "title": "Load file",
    "type": "operator",
    "inputs": {},
    "outputs": {
        "data": {
            "label": "Data"
        }
    },
    "parameters": [
        {
            "id": "filepath",
            "label": "Path:",
            "type": "processflow::file",
            "config": {
                "fileChooser": {
                    "type": "file",
                    "action": "load"
                }
            }
        }
    ]
}
```

Lets explain each key:
* `id`: identifier of the operator
* `title`
* `type`: Type of the operator. For the moment, the value is always `operator`.
* `inputs`: Inputs of the operators. It is a dictionnary. Each key represent the input's identifier, each value a hash
containing its properties. Currently, the only property is `label` that defines how the input is displayed on the
operator.
* `outputs`: Outputs of the operators. The structure is similar to `inputs`.
* `parameters`: All parameters associated to the operator. It is an array containing multiple dictionnaries. Each
dictionnary represents a property. Each dictionnary contains the following keys:
  * `id`
  * `label`
  * `type`: field type. See more explanation below.
  * `config`: configuration of the parameter. It depends on each field type.
  
Several examples of operators can be found in the `demo` module in the `operators` folder. The `all_fields` operator
illustrates how to add all common field types.

### What are field types and how to add a field type

A field type is a way of displaying a parameter. For instance, you can represent a parameter by a simple text input,
or you can represent it using a slider. All common field type are currently located in the `processflow` module.

For instance, the `processflow::file` field type we used earlier is defined in the `static/fieldtypes/file/main.js` file of
the `processflow` module. Let's say you wanted to create your own file field type. You could name it `custom_module::file`
and define your own in the `static/fieldtypes/file/main.js` file of the `custom_module` module. The structure is
always the same here.

### Where is the process file generated

Currently, the process file is generated under the file `workspaces/1/My Project/operators/custom_operator/config.json`.
The structure of the file is similar to the operators' files described above, expect there is an additional `process` key.
The value contains three keys:
* `operators`
* `links`
* `parameters`