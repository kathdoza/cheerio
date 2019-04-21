$(document).ready(function () {
    $('.saved-buttons').on('click', function () {
        // the NEWS article id
        var thisId = $(this).attr("data-value");

        //attach news article _id to the save button in the modal for use in save post
        $("#saveButton").attr({ "data-value": thisId });

        //make an ajax call for the notes attached to this article
        $.get("/notes/" + thisId, function (data) {
            console.log(data);
            //empty modal title, textarea and notes
            $('#noteModalLabel').empty();
            $('#notesBody').empty();
            $('#notestext').val('');

            //delete button for individual note

            //add id of the current NEWS article to modal label
            $('#noteModalLabel').append(' ' + thisId);
            //add notes to body of modal, will loop through if multiple notes
            for (var i = 0; i < data.note.length; i++) {
                var button = ' <a href=/deleteNote/' + data.note[i]._id + '><i class="pull-right fa fa-times fa-2x deletex" aria-hidden="true"></i></a>';
                $('#notesBody').append('<div class="panel panel-default"><div class="noteText panel-body">' + data.note[i].body + '  ' + button + '</div></div>');
            }
        });
    });
    $(".savenote").click(function () {
        // Grab the id associated with the article from the submit button
        var thisId = $(this).attr("data-value");


        // Run a POST request to change the note, using what's entered in the inputs
        $.ajax({
            method: "POST",
            url: "/notes/" + thisId,
            data: {
                // Value taken from title input

                // Value taken from note textarea
                body: $("#notestext").val().trim()
            }
        })
            // With that done
            .done(function (data) {
                // Log the response
                //console.log(data);
                $('#noteModal').modal('hide');

            });
    });
})