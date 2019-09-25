import React,{Component} from 'react';
import './CameraDemo.css';
import {Storage, Auth, PubSub } from "aws-amplify";
import config from "../config";
import { Lambda } from 'aws-sdk';
import {Container,Row,Col, Form,Button} from "react-bootstrap";

export default class CameraDemo extends Component{
  constructor(props){
    super(props)

    this.state= {
      latestImage: "",
      osstatsTopic:"os/stat",
      cameraStopTopic:"camera/stop",
      cameraStartTopic:"camera/start",
      ossstasMessage:"",
      targetFileName:"",
      targetImage:"",
  	  upload:true
    }

    this.getLatestImage()
    this.handleSubscribe()
  }

  componentDidMount = ()=>{
    this.timerID=setInterval(
      ()=>this.getLatestImage(),
      1000)
  }

  componentWillMount = ()=>{
    clearInterval(this.timerID)
  }

  getLatestImage = ()=>{
    this.configureS3()

    Storage.list('',{level:"public"}).then(
      imageList =>{
        let maxImageNum = 1

        //連想配列から最大の画像番号を算出
        imageList.map( image => {
          if(image.key.startsWith("image_")) {
            let imageNum = image.key.slice(6).replace(".jpg","")
            if(maxImageNum < Number(imageNum)){
              maxImageNum = imageNum
            }
          }
        })

        Storage.get("image_" + maxImageNum + ".jpg").then(
          result=>{
            console.log(result)
            this.setState({
              latestImage:result
            })
          }
        ).catch(err=>console.log(err))
      }
    ).catch(err=>console.log(err))

    //TODO remove for debug code
    // clearInterval(this.timerID)
  }

  handleSubscribe = () => {
    PubSub.subscribe(this.state.osstatsTopic).subscribe({
      next:data=> {
        const newMessage = data.value["osstat"]+"\r\n"+this.state.ossstasMessage
        this.setState({
          ossstasMessage:newMessage
        })
      },
      error:error => console.log(error),
      close:()=>console.log("close"),
    })
  }

  configureS3 = () =>{
    Storage.configure({
      bucket:config.s3.BUCKET,
      level:"public",
      region:"ap-northeast-1",
      identityPoolId:config.s3.IDENTITY_POOL_ID
    })  
  }

  handleChange = (event)=>{
    this.setState({
      targetFileName:event.target.value
    })
  }

  getImageFromGGCore=(event)=>{
    event.preventDefault()
    console.log("submit getting image request")
    this.setState({targetImage:"./loading.gif"})


    Auth.currentCredentials().then(credentials=>{
      const lambda = new Lambda({
        credentials:Auth.essentialCredentials(credentials),
        region:config.lambda.REGION
      })

      lambda.invoke({
        FunctionName:"agl-demo-publish-iot",
        Payload:JSON.stringify({filename:this.state.targetFileName})
      },(err,data) => {
        console.log(err,data)
        if(!err){
          this.resendTimerID = setInterval(
            ()=>this.getAttachTargetImageUnderResendFolder(this.state.targetFileName)
            ,3000)
        }
      })
    })
  }

  getAttachTargetImageUnderResendFolder = (imageFilename)=>{
    this.configureS3()
    Storage.get("resend/" + imageFilename).then(
      result=>{
        console.log(result)
        this.setState({
          targetImage:result
        })
        clearInterval(this.resendTimerID)
      }
    ).catch(err=>console.log(err))
  }

  suspendUploadImage = async () => {
    const data = await PubSub.publish(this.state.cameraStopTopic,{msg:"stop camera"})

    console.log("publish camera stop")
    this.setState({
      upload:false
    })
  }

  resumeUploadImage = async () =>{  
    await PubSub.publish(this.state.cameraStartTopic,{msg:"start camera"})

    console.log("publish camera start")
    this.setState({
      upload:true
    })
  }

  render(){
    const latestImageComponent = this.state.latestImage ?
    <img src={this.state.latestImage} width="250px" height="250px"></img> :
    <div></div>

    const targetImageComponent = this.state.targetImage ?
    <img src={this.state.targetImage} width="250px" height="250px"></img>:
    <div></div>

	const uploadButton = 
  <Button onClick={this.state.upload? this.suspendUploadImage:this.resumeUploadImage}>{this.state.upload ? '②カメラ画像の取得中止':'②カメラ画像の取得再開'}</Button>

    return (
      <div className="App">
        <Container className="App-header" fluid="true">
          <Row>
            <Col sm={4} md={4} lg={4}>
              <label>①リアルタイムなカメラ画像表示</label>
              {latestImageComponent}
              <br/>
              {uploadButton}
            </Col>
            <Col  sm={4} md={4} lg={4}>
              <label>③車載器内のストレージ状態確認</label><br/>
              <textarea value={this.state.ossstasMessage} readOnly rows="10" cols="10"></textarea>
            </Col>
            <Col   sm={4} md={4} lg={4}>
              <Form onSubmit={this.getImageFromGGCore}>
                <Form.Label>④ストレージ内のカメラ画像取得要求</Form.Label>
                <Form.Control type="text"  value={this.state.targetFileName} onChange={this.handleChange}></Form.Control>
                <Button variant="primary" type="submit">submit</Button>
              </Form>
              {targetImageComponent}
            </Col>
          </Row>  
          <Row>
            <Col sm={4} md={4} lg={4} >
            </Col>
          </Row>
        </Container>
      </div>
    );  
  }
}
