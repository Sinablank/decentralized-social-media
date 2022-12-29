$(function () {
    $(window).load(function () {
        PrepareNetwork();
    });
});

var JsonContract = null;
var web3 = null;
var MyContract = null;
var Owner = null;
var CurrentAccount = null;
var PostCounter = null;
var IPFS_Hash = null;
var Host_Name = 'https://ipfs.infura.io/ipfs/';
var Content = null;
var flag = 0;
const d = new Date();


const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

function makeHttpObject() {
    if ("XMLHttpRequest" in window) return new XMLHttpRequest();
    else if ("ActiveXObject" in window) return new ActiveXObject("Msxml2.XMLHTTP");
}

async function PrepareNetwork() {
    await loadWeb3();
    await LoadDataSmartContract();
}

async function loadWeb3() {

    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await ethereum.request({ method: 'eth_requestAccounts' }).then(function (accounts) {
            CurrentAccount = accounts[0];
            web3.eth.defaultAccount = CurrentAccount;
            console.log('current account: ' + CurrentAccount);
            setCurrentAccount();
        });
    }
    else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
        $.msgBox({
            title: "Metamask Error",
            content: "Non-Ethereum browser detected. You should consider trying MetaMask!",
            type: "alert"
        });
        // window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

    ethereum.on('accountsChanged', handleAccountChanged);
    ethereum.on('chainChanged', handleChainChanged);

}

function setCurrentAccount() {
    $('#Address').text(CurrentAccount);
}

async function handleAccountChanged() {
    await ethereum.request({ method: 'eth_requestAccounts' }).then(function (accounts) {
        CurrentAccount = accounts[0];
        web3.eth.defaultAccount = CurrentAccount;
        console.log('current account: ' + CurrentAccount);
        setCurrentAccount();
        window.location.reload();
    });
}

async function handleChainChanged(_chainId) {

    window.location.reload();
    console.log('Chain Changed: ', _chainId);
}

async function LoadDataSmartContract() {
    await $.getJSON('Instagram.json', function (contractData) {
        JsonContract = contractData;
    });

    web3 = await window.web3;

    const networkId = await web3.eth.net.getId();

    const networkData = JsonContract.networks[networkId];
    if (networkData) {
        MyContract = new web3.eth.Contract(JsonContract.abi, networkData.address);

        PostCounter = await MyContract.methods.PostCounter().call();
        console.log('PostCounter: ', PostCounter);
        ShowPost();



    }

    $(document).on('click', '#newpost', newpost);

}

function newpost() {

    var description = $("#description").val();
    if (description.trim() == '') {
        $.msgBox({
            title: "Alert Box",
            content: "Please Fill Description!",
            type: "error"
        });
        return;
    }

    MyContract.methods.UplodPost(IPFS_Hash, description, d.toString()).send({ from: CurrentAccount }).then(function (Instance) {

        $.msgBox({
            title: "Uplod Post",
            content: "Post Created By" + Instance.events.PostCreated.returnValues[3],
            type: "alert"
        });

    }).catch(function (error) {

        var msg = error.message;

        var idxbegin = msg.indexOf("Instagram");
        var idxend = msg.indexOf(",", idxbegin);

        var result = msg.slice(idxbegin, idxend - 1);

        if (result == '') {
            $.msgBox({
                title: "Metamask Error",
                content: "You Reject Transaction!",
                type: "error"
            });
        } else {
            $.msgBox({
                title: "User Error",
                content: result,
                type: "error"
            });
        }
    });

    ShowPost();

}

async function addLike(id) {

   // console.log("id : ", id);
    var howLikes = await MyContract.methods.getLike(id).call();
    console.log("howLikes : ", howLikes);

    const found = await howLikes.find(element => element.toLowerCase() == CurrentAccount);
    console.log("found : ", found);

    if (howLikes.length > 0 && found != undefined) {
        if (found.toLowerCase() == CurrentAccount) {
            MyContract.methods.SubLike(id).send({from: CurrentAccount}).then(async function (Instance) {
                $.msgBox({
                    title: "Sub Like",
                    content: "Post Sub Likes",
                    type: "alert"
                });

                let post = await   MyContract.methods.getPost(id).call();

                var idtag = "#like"+id;
                $(idtag).html(post.likeCounter);
   
            }).catch(function (error) {
                var msg = error.message;

                var idxbegin = msg.indexOf("Instagram");
                var idxend = msg.indexOf(",", idxbegin);
        
                var result = msg.slice(idxbegin, idxend - 1);
        
                if (result == '') {
                    $.msgBox({
                        title: "Metamask Error",
                        content: "You Reject Transaction!",
                        type: "error"
                    });
                } else {
                    $.msgBox({
                        title: "User Error",
                        content: result,
                        type: "error"
                    });
                }

                
            });


            
        }else{

            MyContract.methods.AddLike(id).send({from: CurrentAccount}).then(async function (Instance) {
                $.msgBox({
                    title: "Add Like",
                    content: "Post Add Likes",
                    type: "alert"
                });

                let post = await   MyContract.methods.getPost(id).call();

                var idtag = "#like"+id;
                $(idtag).html(post.likeCounter);
   
            }).catch(function (error) {
                var msg = error.message;

                var idxbegin = msg.indexOf("Instagram");
                var idxend = msg.indexOf(",", idxbegin);
        
                var result = msg.slice(idxbegin, idxend - 1);
        
                if (result == '') {
                    $.msgBox({
                        title: "Metamask Error",
                        content: "You Reject Transaction!",
                        type: "error"
                    });
                } else {
                    $.msgBox({
                        title: "User Error",
                        content: result,
                        type: "error"
                    });
                }

                
            });



        }
        
    }else{
        MyContract.methods.AddLike(id).send({from: CurrentAccount}).then(async function (Instance) {
            $.msgBox({
                title: "Add Like",
                content: "Post Add Likes",
                type: "alert"
            });

            let post = await   MyContract.methods.getPost(id).call();

            var idtag = "#like"+id;
            $(idtag).html(post.likeCounter);

        }).catch(function (error) {
            var msg = error.message;

            var idxbegin = msg.indexOf("Instagram");
            var idxend = msg.indexOf(",", idxbegin);
    
            var result = msg.slice(idxbegin, idxend - 1);
    
            if (result == '') {
                $.msgBox({
                    title: "Metamask Error",
                    content: "You Reject Transaction!",
                    type: "error"
                });
            } else {
                $.msgBox({
                    title: "User Error",
                    content: result,
                    type: "error"
                });
            }

            
        });




    }

    
}

async function adddisLike(id) {

    // console.log("id : ", id);
     var howLikes = await MyContract.methods.getdisLike(id).call();
     console.log("howLikes : ", howLikes);
 
     const found = await howLikes.find(element => element.toLowerCase() == CurrentAccount);
     console.log("found : ", found);
 
     if (howLikes.length > 0 && found != undefined) {
         if (found.toLowerCase() == CurrentAccount) {
             MyContract.methods.SubdisLike(id).send({from: CurrentAccount}).then(async function (Instance) {
                 $.msgBox({
                     title: "Sub disLike",
                     content: "Post Sub disLikes",
                     type: "alert"
                 });
 
                 let post = await   MyContract.methods.getPost(id).call();
 
                 var idtag = "#dislike"+id;
                 $(idtag).html(post.disLikeCounter);
    
             }).catch(function (error) {
                 var msg = error.message;
 
                 var idxbegin = msg.indexOf("Instagram");
                 var idxend = msg.indexOf(",", idxbegin);
         
                 var result = msg.slice(idxbegin, idxend - 1);
         
                 if (result == '') {
                     $.msgBox({
                         title: "Metamask Error",
                         content: "You Reject Transaction!",
                         type: "error"
                     });
                 } else {
                     $.msgBox({
                         title: "User Error",
                         content: result,
                         type: "error"
                     });
                 }
 
                 
             });
 
 
             
         }else{
 
             MyContract.methods.AdddisLike(id).send({from: CurrentAccount}).then(async function (Instance) {
                 $.msgBox({
                     title: "Add disLike",
                     content: "Post Add disLikes",
                     type: "alert"
                 });
 
                 let post = await   MyContract.methods.getPost(id).call();
 
                 var idtag = "#dislike"+id;
                 $(idtag).html(post.disLikeCounter);
    
             }).catch(function (error) {
                 var msg = error.message;
 
                 var idxbegin = msg.indexOf("Instagram");
                 var idxend = msg.indexOf(",", idxbegin);
         
                 var result = msg.slice(idxbegin, idxend - 1);
         
                 if (result == '') {
                     $.msgBox({
                         title: "Metamask Error",
                         content: "You Reject Transaction!",
                         type: "error"
                     });
                 } else {
                     $.msgBox({
                         title: "User Error",
                         content: result,
                         type: "error"
                     });
                 }
 
                 
             });

         }
         
     }else{
        MyContract.methods.AdddisLike(id).send({from: CurrentAccount}).then(async function (Instance) {
            $.msgBox({
                title: "Add disLike",
                content: "Post Add disLikes",
                type: "alert"
            });

            let post = await   MyContract.methods.getPost(id).call();

            var idtag = "#dislike"+id;
            $(idtag).html(post.disLikeCounter);

        }).catch(function (error) {
            var msg = error.message;

            var idxbegin = msg.indexOf("Instagram");
            var idxend = msg.indexOf(",", idxbegin);
    
            var result = msg.slice(idxbegin, idxend - 1);
    
            if (result == '') {
                $.msgBox({
                    title: "Metamask Error",
                    content: "You Reject Transaction!",
                    type: "error"
                });
            } else {
                $.msgBox({
                    title: "User Error",
                    content: result,
                    type: "error"
                });
            }

            
        });



 
 
 
     }
 
     
 }

function previewFile() {

    const file = document.querySelector('input[type=file]').files[0];

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.addEventListener("load", async function () {

        //   console.log('result : ', reader.result);

        Content = reader.result;

        if (flag == 0) {
            var br = '<br>';
            $('#showimgnft').append(br);
            var newEleman = '<img id = "nftimg" src = "#">' + '</img>';
            $('#showimgnft').append(newEleman);
        }
        flag = 1;

        $("#nftimg").attr("src", Content);

        $("#overlay").fadeIn(300);

        await ipfs.add(Content, function (err, hash) {

            if (err) {
                $.msgBox({
                    title: "IPFS Error",
                    content: "Error Add to IPFS!",
                    type: "error"
                });
                return false;
            } else {
                IPFS_Hash = hash;
                console.log('IPFS_Hash : ', IPFS_Hash);
                $("#overlay").fadeOut(300);
            }

        });

    });

}

async function ShowPost() {

    $("#overlay").fadeIn(300);

    PostCounter = await MyContract.methods.PostCounter().call();

    for (let index = PostCounter - 1; index >= 0; index--) {
        await CreatePostDesign(index);

        let post = await MyContract.methods.getPost(index).call();
        console.log(post.commentCounter);
        await CreateComment(index, post.commentCounter);

    }


    $("#overlay").fadeOut(300);
}

function sleep(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

}

async function CreatePostDesign(index) {

    let post = await MyContract.methods.getPost(index).call();
   // console.log("post : ",post);

    var dateCheck = post.date.slice(4, 25);
    getImageSRC(post.hashImage);

    await sleep(100);
    
    var htmlTag = 
    '<div class="loadMore">'+ 
        '<div class="central-meta item">'+
            '<div class="user-post">'+
                '<div class="friend-info">'+
                    '<div class="friend-name">'+
                        '<ins><a href="#" title="">'+ post.author +'</a></ins>'+
                        '<span>published: '+dateCheck+'</span>'+
                    '</div>'+
                    '<hr>'+
                    '<div class="post-meta">'+
                        '<img src='+ Content +' alt="" id = "ShowIMG">'+
                        
                        '<div class="we-video-info">'+
                            '<ul>'+
                                '<li>'+
                                    '<span class="comment" data-toggle="tooltip" title="Comments">'+
                                    '<i class="fa fa-comments-o"></i>'+
                                    '<ins id = "">'+ post.commentCounter +'</ins>'+
                                    '</span>'+
                                '</li>'+
                                '<li>'+
                                    '<span class="like" data-toggle="tooltip" title="like">'+
                                    '<i class="ti-heart" onclick = "addLike('+ post.id +')"></i>'+
                                    '<ins id = "like'+index+'">'+ post.likeCounter +'</ins>'+
                                    '</span>'+
                                '</li>'+
                                '<li>'+
                                    '<span class="dislike" data-toggle="tooltip" title="dislike">'+
                                    '<i class="ti-heart-broken" onclick = "adddisLike('+ post.id +')"></i>'+
                                    '<ins id = "dislike'+index+'">'+ post.disLikeCounter +'</ins>'+
                                    '</span>'+
                                '</li>'+
                                '<li>'+
                                    '<span class="like" data-toggle="tooltip" title="Tip" style = "color:purple;">'+
                                    '<i class="fa fa-dollar" onclick = "CheckTip('+ post.id +')"></i>'+
                                    '<ins id = "tip'+index+'">'+ web3.utils.fromWei(post.tipAmount, 'ether') +' ether</ins>'+
                                    '</span>'+
                                '</li>'+
                            '</ul>'+
                        '</div>'+
                        //  '<hr/>'+
                        '<div class="description">'+
                            '<p style = "color:black;">'+ post.description +'</p>'+
                        '</div>'+
                        // '<hr>'+
                    '</div>'+
                '</div>'+

                '<div class="coment-area">'+
                '<li class="post-comment">'+
                    '<div style = "color : #7FBA00;">'+CurrentAccount +'</div'+
                    '<div class="post-comt-box">'+
                        '<div>'+
                            '<textarea placeholder="Post your comment" id = "comment'+index+'"></textarea>'+									
                            '<button onclick = "AddComment('+ post.id +')" class="btn btn-primary">Comment</button>'+
                        '</div>'+
                    '</div>'+
                '</li>'+

                '<li id = "comments'+index+'">'+
               
                '</li>'+
            '</div>'+

            '</div>'+
        '</div>'+
    '</div>';    

    $("#test").append(htmlTag);


}

function getImageSRC(HashIMG) {

    var imgURL = Host_Name + HashIMG;

    var request = makeHttpObject();
    request.open("GET", imgURL, true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            Content = request.responseText;
            //   console.log("Content : ",Content);
        }

    }

}

function AddComment(id) {

    var cmid = "#comment" + id;
    var comment = $(cmid).val();
    console.log(comment);
    if (comment.trim() == '') {
        $.msgBox({
            title: "Comment Error",
            content: "Please Fill Comment!",
            type: "error"
        });
        return;
    }

    MyContract.methods.AddComment(id, comment, d.toString()).send({ from: CurrentAccount }).then(function (Instance) {

        $.msgBox({
            title: "Add Comment",
            content: "Comment Created By" + Instance.events.CommentCreated.returnValues[3],
            type: "alert"
        });


    }).catch(function (error) {

        var msg = error.message;
        console.log(msg);
        var idxbegin = msg.indexOf("Instagram");
        var idxend = msg.indexOf(",", idxbegin);

        var result = msg.slice(idxbegin, idxend - 1);

        if (result == '') {
            $.msgBox({
                title: "Metamask Error",
                content: "You Reject Transaction!",
                type: "error"
            });
        } else {
            $.msgBox({
                title: "User Error",
                content: result,
                type: "error"
            });
        }
    });


}

async function CreateComment(id, cmidx) {
    
    CM = await MyContract.methods.getComments(id).call();
    console.log("cmidx : "+cmidx);
    // console.log("CMcounter"+CMcounter);

    for (let index = cmidx-1; index >= 0; index--) {

        CreateCommentDesign(CM[index], id);
        console.log("CM : "+CM[index]);
        
    }  
      

}

function CreateCommentDesign(CM, id) {

    let datecomment = CM.date.slice(4, 25);

    var htmlTagC = 
        '<div class="we-comment">'+
            '<div class="coment-head">'+
                '<h5><a href="#" title="" style = "color:blue;">'+CM.author+'</a></h5>'+
                '<span>'+datecomment+'</span>'+
            '</div>'+
            '<p style = "color:black;">'+CM.comment+'</p>'+
        '</div>'+
        '<br>';
    let idcomment = "#comments"+id;
    $(idcomment).append(htmlTagC);
}

function CheckTip(id) {

    $.msgBox({ type: "prompt",
        title: "Value Of Tip(Ether)",
        inputs: [
            { header: "Tip Amount(Ether)", type: "number", value : 0, name: "tip" }],
        buttons: [
            { value: "Tip" }, {value:"Cancel"}],
        success: function (result, values) {
            // alert(values[0].value);
            // tipAmount = values[0].value;
            if (values[0].value != 0) {
                Tip(id, values[0].value);
            }else{
                $.msgBox({
                    title: "Textbox Error",
                    content: "Please insert Non Zero",
                    type: "error"
                });
            }
           
        }
    });
    
}

function Tip(id, tip) {

    let tipAmount = web3.utils.toWei(tip, 'ether');
    console.log("tipAmount:" + tipAmount);
    MyContract.methods.TipPosts(id).send({ from: CurrentAccount , value: tipAmount  }).then(async function (Instance) {
        $.msgBox({
            title: "Tip Post",
            content: "Tip Amount : " + Instance.events.TipPosted.returnValues[1],
            type: "alert"
        });
        
        window.location.reload();
    }).catch(function (error) {
        var msg = error.message;

        var idxbigin = msg.indexOf("Instagram");
        var idxend = msg.indexOf(",", idxbigin);
        var result = msg.slice(idxbigin, idxend - 1);

        if (result == '') {
            $.msgBox({
                title: "MetaMask Error",
                content: "You Reject Transaction",
                type: "error"
            });
        }else{
            $.msgBox({
                title: "User Error",
                content: result,
                type: "error"
            });
        }
    });
    
}