import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { ConferenceService } from '../shared/services/conference.service';
import { Participant, InstantMessage, PeerConnection } from '../../../shared/models';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';


@Pipe({
    name: 'sanitizeUrl'
})
class SanitizeUrl implements PipeTransform  {

   constructor(private _sanitizer: DomSanitizer){}  

   transform(v: string) : SafeUrl {
      return this._sanitizer.bypassSecurityTrustUrl(v); 
   } 
} 

@Component({
    moduleId: module.id,
    selector: 'conference',
    templateUrl: 'conference.component.html',



})
export class ConferenceComponent implements OnInit {


    LocalStreamUrl: SafeUrl;
    MainVideoUrl: SafeUrl;

    public inConference: boolean;
    public InstantMessages:Array<InstantMessage>;
    public InstantMessage:InstantMessage;

    public Participants: Array<Participant>;

    public Context: string; //  context can be condidered as a "room"

    constructor(private conferenceService: ConferenceService, private sanitizer: DomSanitizer) {
        this.InstantMessages = new Array<InstantMessage>();
        this.InstantMessage = new InstantMessage();
                
    

        this.Participants = new Array<Participant>();

        navigator.getUserMedia({ audio: true, video: true }, (stream: MediaStream) => {
            this.LocalStreamUrl = sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(stream));
            setTimeout( () => {
                conferenceService.addLocalMediaStream(stream);
            },1000);
          

        }, (err) => {
           
            console.log("getUserMedia error", err);
        })

        this.Participants = conferenceService.RemoteStreams;
        this.InstantMessages = conferenceService.InstantMessages;

        conferenceService.onParticipant = (p: Participant) => {
            this.MainVideoUrl = p.url;
        }
        conferenceService.getSlug().subscribe( (a:string) => {
            this.Context = a;
        });
    }
    sendIM()
    {
        this.conferenceService.sendInstantMessage(this.InstantMessage);

        this.InstantMessage.text = "";
    }
    changeMainVideo(participant:Participant)
    {
        this.MainVideoUrl =  participant.url;
    }

    joinConference() {
        this.conferenceService.joinConference(this.Context);
        this.inConference = true;
    }

    ngOnInit() {

    }
}

