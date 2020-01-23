let fnames = [];
let usingfnames;
let usingSavedNames;
let spaceBetween = 6;
let saveFileName = 'IRselectedNames.txt';
let fnamesFileName = 'fnames/IRfnames.txt';
let settingsFileName = 'settings.json';
let savedNames = [];
let firstLoad = true;
let addedImgs = [];
let nonVidfnames;
let vidfnames;
let nonVidSavedNames;
let vidSavedNames;

// Settings
let startType;
let startNumImages;
let startNumPerRow;
let randomImageChoice;
let includeStatic;
let startSelected;
let defaultMaxNumImgs;
let autoResize;
let lastWidth;

let startingNumVideos;
let videosOnly;
let muteVideos;
let playVideos;
let videoVolume;
let noVideos;

let reMasonryDelay = 0;
let canReMasonry = true;

const observer = lozad();

let types = ['Asian'];
for (type of types) {
    $('#type').append($('<option>', { value: type, text: type }));
}

let largeImageTypes = []

let videoExts = ['mp4', 'webm', 'webp'];

function switchType(newType) {
    $('#type option').each(function() {
        if ($(this).val() == newType) {
            $(this).attr('selected', true);
        }
    });

    saveFileName = newType + 'selectedNames.txt';
    fnamesFileName = 'fnames/' + newType + 'fnames.txt';

    nonVidfnames = [];
    vidfnames = [];

    fnames = loadStrings(fnamesFileName,
        function() {
            if(fnames[fnames.length-1].trim() == "") fnames.pop()
             for (i in fnames) {
                if(fnames[i].trim() != "") {
                    fnames[i] = fnames[i].replace("D:\\", "../../../../");
                    if (videoExts.includes(getExtension(fnames[i]))) {
                        vidfnames.push(fnames[i]);
                    } else {
                        nonVidfnames.push(fnames[i]);
                    }
                }
            }
            if (startNumImages > fnames.length) startNumImages = fnames.length;
            $('#totalfilecount').html('/' + fnames.length);
            // $('#perrow').val(startNumPerRow);
            // $('#staticimages').prop('checked', includeStatic);
            // $('#randomorder').prop('checked', randomImageChoice);
            // $('#videosonly').prop('checked', videosOnly);
            // $('#novideos').prop('checked', noVideos);
            // $('#mutevideos').prop('checked', muteVideos);
            // $('#videovolume').prop('value', videoVolume);
            // $('#startselected').prop('checked', startSelected);
        }
    );

    loadSelected();
    firstLoad = true;
}

function saveSettings() {
    let json = {};
    json.startNumImages = $('#numimages').val();
    json.startType = $('#type option:selected').val();
    json.startNumPerRow = $('#perrow').val();
    json.includeStatic = $('#staticimages').prop('checked');
    json.randomImageChoice = $('#randomorder').prop('checked');
    json.videosOnly = $('#videosonly').prop('checked');
    json.noVideos = $('#novideos').prop('checked');
    json.muteVideos = $('#mutevideos').prop('checked');
    json.videoVolume = $('#videovolume').prop('value');
    json.startSelected = $('#startselected').prop('checked');
    json.autoResize = $('#autoresize').prop('checked');
    json.reverseSelected = $('#reverseOrder').prop('checked');
    saveJSON(json, settingsFileName);
}

function resetOptions() {
    let json = loadJSON(settingsFileName, function () {
        startType = json.startType;
        startNumPerRow = json.startNumPerRow;
        startNumImages = json.startNumImages;
        startSelected = json.startSelected;
        includeStatic = json.includeStatic;
        randomImageChoice = json.randomImageChoice;
        autoResize = json.autoResize;
        noVideos = json.noVideos;
        videosOnly = json.videosOnly;
        muteVideos = json.muteVideos;
        videoVolume = json.videoVolume;
        $('#perrow').val(startNumPerRow);   
        $('#numimages').val(startNumImages);
        $('#startselected').prop('checked', startSelected);
        $('#staticimages').prop('checked', includeStatic);
        $('#randomorder').prop('checked', randomImageChoice);
        $('#autoresize').prop('checked', autoResize);
        $('#videosonly').prop('checked', videosOnly);
        $('#novideos').prop('checked', noVideos);
        $('#mutevideos').prop('checked', muteVideos);
        $('#videovolume').prop('value', videoVolume);

        switchType(startType);
    });
}


function preload() {
    resetOptions();
}

function checkFormat(fname) {
    let includeStaticImages = $('#staticimages').prop('checked');
    return (!includeStaticImages && fname.substring(fname.length - 3) == 'gif') || (includeStaticImages);
}

function getExtension(fname) {
    return fname.substring(fname.lastIndexOf('.') + 1, fname.length);
}

function genImages() {
    addedImgs = [];

    let newWidth = refreshImageWidth();
    $('.selected').attr('width', newWidth);

    $('#pics').find('*').not('.selected').remove();

    let numImages = parseInt($('#numimages').val());
    let imageWidth = parseInt($('#imagewidth').val());
    randomImageChoice = $('#randomorder').prop('checked');

    noVideos = $('#novideos').prop('checked');
    videosOnly = $('#videosonly').prop('checked');
    muteVideos = $('#mutevideos').prop('checked');

    startSelected = $('#startselected').prop('checked');

    usingfnames = [];
    usingSavedNames = [];

    if (noVideos) {
        usingfnames = nonVidfnames.slice();
        usingSavedNames = nonVidSavedNames.slice();
    } else if (videosOnly) {
        usingfnames = vidfnames.slice();
        usingSavedNames = vidSavedNames.slice();
    } else {
        usingfnames = fnames.slice();
        usingSavedNames = savedNames.slice();
    }

    if (randomImageChoice) usingfnames.sort(() => Math.random() - 0.5);

    usingfnames.sort(function(a, b) {
        let e1 = getExtension(a);
        let e2 = getExtension(b);

        if (videoExts.includes(e1) && !videoExts.includes(e2)) return -1;
        if (!videoExts.includes(e1) && videoExts.includes(e2)) return 1;
        return 0;
    });

    savedNames.sort(function(a, b) {
        let e1 = getExtension(a);
        let e2 = getExtension(b);

        if (videoExts.includes(e1) && !videoExts.includes(e2)) return -1;
        if (!videoExts.includes(e1) && videoExts.includes(e2)) return 1;
        return 0;
    });

    let videosAdded = 0;

    // Saved
    if (firstLoad && startSelected) {
        for (let i = 0; i < usingSavedNames.length; i++) {
            let reverseOrder = $('#reverseOrder').prop('checked');
            if (reverseOrder) selectedIdx = usingSavedNames.length - 1 - i;
            let idx = usingfnames.indexOf(usingSavedNames[i]);
            if (idx != -1) usingfnames.splice(idx, 1);
            saved = true;

            addedImgs.push(usingSavedNames[i]);

            if (addedImgs.length <= numImages) {
                let img;

                if (videoExts.includes(getExtension(usingSavedNames[i]))) {
                    if (muteVideos) img = $('<video loop muted controls>');
                    else img = $('<video loop controls>');
                    img.addClass('isvideo');
                    img.prop('volume', videoVolume);
                    let source = $('<source>');
                    source.attr('src', usingSavedNames[i]);
                    img.append(source);
                } else {
                    img = $('<img>');
                    img.attr('src', usingSavedNames[i]);
                }
                img.addClass('pic');
                img.addClass('lozad');
                img.attr('width', imageWidth);
                img.addClass('selected');
                $('#pics').append(img);
            } else break;
        }
    }

    //Rest 
    for (let i = 0; i < usingfnames.length; i++) {
        if (!noVideos && !videosOnly && videosAdded >= startingNumVideos) {
            noVideos = true;
        }
        if ((noVideos && !videoExts.includes(getExtension(usingfnames[i])) && checkFormat(usingfnames[i])) || (videosOnly && videoExts.includes(getExtension(usingfnames[i]))) || (!noVideos && !videosOnly)) {
            addedImgs.push(usingfnames[i]);

            if (addedImgs.length <= numImages) {
                let img;
                if (videoExts.includes(getExtension(usingfnames[i]))) {
                    videosAdded++;
                    if (muteVideos) img = $('<video loop muted controls>');
                    else img = $('<video loop controls>');
                    img.addClass('isvideo');
                    img.prop('volume', videoVolume);
                    let source = $('<source>');
                    source.attr('src', usingfnames[i]);
                    img.append(source);
                } else {
                    img = $('<img>');
                    img.attr('src', usingfnames[i]);
                }
                img.addClass('pic');
                img.addClass('lozad');
                img.attr('width', imageWidth);
                // img.attr('height', ((imageWidth/img.naturalWidth) * img.naturalHeight));
                $('#pics').append(img);
            } else break;
        }
    }

    observer.observe();

    firstLoad = false;

    $('.pic').click(function() {
        $(this).toggleClass('selected');
    });


    $('#pics').imagesLoaded().progress(function() {
        // doMasonry();
        // $('#pics').masonry('reloadItems');
        // $('#pics').masonry({
        //     itemSelector: '.pic',
        //     transitionDuration: 0,
        //     columnWidth: imageWidth,
        //     gutter: spaceBetween
        // });
        // refreshImageWidth();
    });

    $('#pics').imagesLoaded(function() {
        doMasonry();
        // $('#pics').masonry('reloadItems');
    });

    // $('video').on('load loadeddata', function() {
    //     $('#pics').masonry('layout');
    // });
}

function doMasonry() {
    let imageWidth = parseInt($('#imagewidth').val());
    $('#pics').masonry({
        itemSelector: '.pic',
        transitionDuration: 0,
        columnWidth: imageWidth,
        gutter: spaceBetween
    });
}

function clearSelected() {
    $('#pics').find('*').filter('.selected').toggleClass('selected');
}

function saveSelected() {
    let selectedfnames = [];
    $('.selected').each(function() {
        let src = $(this)[0].currentSrc;
        let toadd = '../../../' + src.substr(src.indexOf('Misc'));
        if (!selectedfnames.includes(toadd)) {
            let edited = toadd;
            edited = toadd.replace('%20', ' ');
            selectedfnames.push(edited);
        }
    });
    if ($('#reverseOrder').prop('checked')) selectedfnames.reverse();
    saveStrings(selectedfnames, saveFileName);
}



function loadSelected() {
    firstLoad = true;
    savedNames = [];
    vidSavedNames = [];
    nonVidSavedNames = [];
    let f = 'selectedNames/' + saveFileName;
    $.get(f).done(function() {
            loadStrings(f, function(result) {
                savedNames = result;
                vidSavedNames = [];
                nonVidSavedNames = [];
                for (let i = savedNames.length - 1; i >= 0; i--) {
                    if (savedNames[i].trim() == "") savedNames.splice(i, 1);
                    else if (videoExts.includes(getExtension(savedNames[i]))) {
                        vidSavedNames.unshift(savedNames[i]);
                    } else {
                        nonVidSavedNames.unshift(savedNames[i]);
                    }
                }
            });
        }).fail( function() {
            let arr = [''];
            save(arr, saveFileName);
        });
    // loadStrings('selectedNames/' + saveFileName, function(result) {
    //     savedNames = result;
    //     vidSavedNames = [];
    //     nonVidSavedNames = [];
    //     for (let i = savedNames.length - 1; i >= 0; i--) {
    //         if (savedNames[i].trim() == "") savedNames.splice(i, 1);
    //         else if (videoExts.includes(getExtension(savedNames[i]))) {
    //             vidSavedNames.unshift(savedNames[i]);
    //         } else {
    //             nonVidSavedNames.unshift(savedNames[i]);
    //         }
    //     }
    // }, function(e) {
    //     savedNames = [];
    // });
}

function refreshImageWidth() {
    let perRow = parseInt($('#perrow').val());
    if (perRow != NaN && perRow > 0) {
        let newWidth = floor($('#pics').width() / perRow) - spaceBetween - 5;
        $('#imagewidth').val(newWidth);
        return newWidth;
    }
}

function resizeImages(newWidth) {
    $('.pic').attr('width', $('#imagewidth').val());
    doMasonry();
}

function setup() {
    refreshImageWidth();

    $('#perrow').blur(function() { resizeImages(refreshImageWidth()) });

    $('#imagewidth').blur(resizeImages);

    $('#autoresize').change(function() {
        refreshImageWidth();
    });

    $('#type').change(function() {
        switchType($('#type option:selected').val());
    });

    $('#videosonly').change(function() {
        if ($('#videosonly').prop('checked')) {
            $('#numimages').val(startingNumVideos);
        }
    });

    $('#mutevideos').change(function() {
        $('video').prop('muted', !$('video').prop('muted'));
    });

    $('#playvideos').change(function() {
        $('video').each(function() {
            if ($(this).prop('paused')) {
                $(this).get(0).play();
            } else $(this).get(0).pause();
        });
    });

    $("#videovolume").on('input', function() {
        videoVolume = $("#videovolume").prop('value');
        $('video').each(function() {
            $(this).prop('volume', videoVolume);
        });
    });

    $('#regen').click(function(event) {
        if (event.originalEvent.detail != 0) genImages();
    });

    $('#clearselected').click(clearSelected);

    $('#saveselected').click(saveSelected);

    $('#loadselected').click(loadSelected);

    $('#savesettings').click(saveSettings);

    $(window).resize(function() {
        if($('#autoresize').prop('checked')) refreshImageWidth();
        if(canReMasonry) {
            canReMasonry = false;
            setTimeout(function() {
                resizeImages();
                canReMasonry = true;
            }, reMasonryDelay);
        }
    });

    $(document).keypress(function(e) {
        if (e.which == 13) {
            genImages();
        }

        if (e.which == 32) {
            e.preventDefault();
            $('#playvideos').prop('checked', !$('#playvideos').prop('checked'));
            $('video').each(function() {
                if ($(this).prop('paused')) {
                    $(this).get(0).play();
                } else $(this).get(0).pause();
            });
            // window.scroll({
            //     top: 0,
            //     behavior: 'smooth'
            // });
        }
    });
}