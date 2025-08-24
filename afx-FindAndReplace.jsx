/*
Find & Replace Panel for After Effects
Place this file in: Scripts\ScriptUI Panels\
*/

(function buildUI(thisObj) {
    
    // Create the UI panel
    function createUI(thisObj) {
        var panel = (thisObj instanceof Panel) ? thisObj : new Window("dialog", "Find & Replace");
        
        // Set panel properties
        panel.orientation = "column";
        panel.alignChildren = ["fill", "top"];
        panel.spacing = 10;
        panel.margins = 16;
        panel.preferredSize.width = 320;
        
        // Find input group
        var findGroup = panel.add("group");
        findGroup.orientation = "row";
        findGroup.alignChildren = ["fill", "center"];
        findGroup.spacing = 4;
        
        var findSubGroup = findGroup.add("group");
        findSubGroup.orientation = "column";
        findSubGroup.alignChildren = ["fill", "top"];
        findSubGroup.spacing = 4;
        
        findSubGroup.add("statictext", undefined, "Find:");
        var findText = findSubGroup.add("edittext", undefined, "");
        findText.characters = 25;
        
        // Replace input group
        var replaceGroup = panel.add("group");
        replaceGroup.orientation = "row";
        replaceGroup.alignChildren = ["fill", "center"];
        replaceGroup.spacing = 4;
        
        var replaceSubGroup = replaceGroup.add("group");
        replaceSubGroup.orientation = "column";
        replaceSubGroup.alignChildren = ["fill", "top"];
        replaceSubGroup.spacing = 4;
        
        replaceSubGroup.add("statictext", undefined, "Replace with:");
        var replaceText = replaceSubGroup.add("edittext", undefined, "");
        replaceText.characters = 25;
        
        // Swap button
        var swapBtn = replaceGroup.add("button", undefined, "⇅");
        swapBtn.preferredSize.width = 30;
        swapBtn.preferredSize.height = 20;
        swapBtn.alignment = ["right", "bottom"];
        
        // Move the swap button to align with find group too
        findGroup.add("group"); // spacer to align with swap button
        
        // Buttons group
        var buttonGroup = panel.add("group");
        buttonGroup.orientation = "column";
        buttonGroup.alignChildren = ["fill", "center"];
        buttonGroup.spacing = 8;
        
        var projectBtn = buttonGroup.add("button", undefined, "Find & Replace (Project)");
        var compBtn = buttonGroup.add("button", undefined, "Find & Replace (Composition)");
        
        // Status text - make it wider and use multiline
        var statusText = panel.add("statictext", undefined, "Ready", {multiline: true});
        statusText.alignment = ["fill", "top"];
        statusText.preferredSize.height = 40;
        statusText.graphics.foregroundColor = statusText.graphics.newPen(statusText.graphics.PenType.SOLID_COLOR, [0.6, 0.6, 0.6], 1);
        
        // Helper function to escape special regex characters
        function escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\        // Helper function to update status');
        }
        
        // Helper function to update status
        function updateStatus(message, isError) {
            statusText.text = message;
            if (isError) {
                statusText.graphics.foregroundColor = statusText.graphics.newPen(statusText.graphics.PenType.SOLID_COLOR, [1, 0.3, 0.3], 1);
            } else {
                statusText.graphics.foregroundColor = statusText.graphics.newPen(statusText.graphics.PenType.SOLID_COLOR, [0.3, 0.8, 0.3], 1);
            }
        }
        
        // Validation function
        function validateInputs() {
            var findValue = findText.text;
            if (findValue === "") {
                updateStatus("Please enter text to find", true);
                return false;
            }
            return true;
        }
        
        // Project find & replace function
        function findReplaceProject() {
            if (!validateInputs()) return;
            
            try {
                app.beginUndoGroup("Find & Replace Project Items");
                
                var project = app.project;
                if (!project) {
                    updateStatus("No project open", true);
                    return;
                }
                
                var findValue = findText.text;
                var replaceValue = replaceText.text;
                var replacedCount = 0;
                var totalItems = project.numItems;
                
                updateStatus("Processing...", false);
                
                // Build array of items to process first (avoid index issues)
                var itemsToProcess = [];
                for (var i = 1; i <= totalItems; i++) {
                    var item = project.item(i);
                    if (item && item.name.indexOf(findValue) !== -1) {
                        itemsToProcess.push(item);
                    }
                }
                
                // Process the items
                for (var j = 0; j < itemsToProcess.length; j++) {
                    var currentItem = itemsToProcess[j];
                    if (currentItem && currentItem.name) {
                        var originalName = currentItem.name;
                        var regex = new RegExp(escapeRegExp(findValue), 'g');
                        var newName = originalName.replace(regex, replaceValue);
                        
                        if (newName !== originalName) {
                            currentItem.name = newName;
                            replacedCount++;
                        }
                    }
                }
                
                app.endUndoGroup();
                
                if (replacedCount > 0) {
                    updateStatus("Replaced '" + findValue + "' in " + replacedCount + " project item(s)", false);
                } else {
                    updateStatus("No project items found containing '" + findValue + "'", false);
                }
                
            } catch (error) {
                app.endUndoGroup();
                updateStatus("Error: " + error.toString(), true);
            }
        }
        
        // Composition find & replace function
        function findReplaceComposition() {
            if (!validateInputs()) return;
            
            try {
                app.beginUndoGroup("Find & Replace Composition Layers");
                
                var activeComp = app.project.activeItem;
                if (!activeComp || !(activeComp instanceof CompItem)) {
                    updateStatus("No active composition found", true);
                    return;
                }
                
                var findValue = findText.text;
                var replaceValue = replaceText.text;
                var replacedCount = 0;
                var totalLayers = activeComp.numLayers;
                
                updateStatus("Processing...", false);
                
                // Build array of layers to process first (avoid index issues)
                var layersToProcess = [];
                for (var i = 1; i <= totalLayers; i++) {
                    var layer = activeComp.layer(i);
                    if (layer && layer.name.indexOf(findValue) !== -1) {
                        layersToProcess.push(layer);
                    }
                }
                
                // Process the layers
                for (var j = 0; j < layersToProcess.length; j++) {
                    var currentLayer = layersToProcess[j];
                    if (currentLayer && currentLayer.name) {
                        var originalName = currentLayer.name;
                        var regex = new RegExp(escapeRegExp(findValue), 'g');
                        var newName = originalName.replace(regex, replaceValue);
                        
                        if (newName !== originalName) {
                            currentLayer.name = newName;
                            replacedCount++;
                        }
                    }
                }
                
                app.endUndoGroup();
                
                if (replacedCount > 0) {
                    updateStatus("Replaced '" + findValue + "' in " + replacedCount + " layer(s) in '" + activeComp.name + "'", false);
                } else {
                    updateStatus("No layers found containing '" + findValue + "' in '" + activeComp.name + "'", false);
                }
                
            } catch (error) {
                app.endUndoGroup();
                updateStatus("Error: " + error.toString(), true);
            }
        }
        
        // Swap button functionality
        swapBtn.onClick = function() {
            var tempText = findText.text;
            findText.text = replaceText.text;
            replaceText.text = tempText;
            updateStatus("Swapped find and replace text", false);
            statusText.graphics.foregroundColor = statusText.graphics.newPen(statusText.graphics.PenType.SOLID_COLOR, [0.3, 0.6, 1], 1);
        };
        
        // Button event handlers
        projectBtn.onClick = function() {
            findReplaceProject();
        };
        
        compBtn.onClick = function() {
            findReplaceComposition();
        };
        
        // Enter key support
        findText.onChanging = function() {
            if (statusText.text.indexOf("Error") !== -1 || statusText.text.indexOf("Please enter") !== -1) {
                updateStatus("Ready", false);
                statusText.graphics.foregroundColor = statusText.graphics.newPen(statusText.graphics.PenType.SOLID_COLOR, [0.6, 0.6, 0.6], 1);
            }
        };
        
        replaceText.onChanging = function() {
            if (statusText.text.indexOf("Error") !== -1 || statusText.text.indexOf("Please enter") !== -1) {
                updateStatus("Ready", false);
                statusText.graphics.foregroundColor = statusText.graphics.newPen(statusText.graphics.PenType.SOLID_COLOR, [0.6, 0.6, 0.6], 1);
            }
        };
        
        // Focus on find text when panel opens
        panel.onShow = function() {
            findText.active = true;
        };
        
        return panel;
    }
    
    // Build and show the UI
    var ui = createUI(thisObj);
    
    if (ui instanceof Window) {
        ui.center();
        ui.show();
    } else {
        ui.layout.layout(true);
    }
    
})(this);