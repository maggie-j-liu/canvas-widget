# canvas widget

![small widget](/assets/small.png)

A widget for macOS that allows you to view your Canvas grades in a sidebar widget.

## Setup

1. Install the [Scriptable app](https://scriptable.app/mac-beta/).
2. Paste the script from [`index.js`](https://raw.githubusercontent.com/maggie-j-liu/canvas-widget/main/index.js) into a new script in Scriptable and save. ![adding the script to Scriptable](/assets/add_to_scriptable.png)
3. Add the Scriptable widget to your sidebar. ![adding the widget to the sidebar](/assets/addwidget.png)
4. Right-click on the widget and select `Edit "Scriptable"`. ![editing widget](/assets/editmenu.png)
5. Select the `Canvas` script and add your canvas URL and token as a parameter. The parameter should be formatted like `https://canvas.instructure.com|TOKEN`, where your canvas URL and token (see [these instructions](https://community.canvaslms.com/t5/Student-Guide/How-do-I-manage-API-access-tokens-as-a-student/ta-p/273) for obtaining a token) are separated by a pipe. ![configuring the widget](/assets/configure.png)
6. Click `Done`, and your widget should display your grades!
   ![the final widget](/assets/final.png)

## Demo

![all the widget sizes](/assets/allwidgets.png)
