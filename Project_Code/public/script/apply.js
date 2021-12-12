function apply(fileId, jobId) {
  if (confirm("Are you sure to select this resume to apply?")) {
    applyReq = {
      method: "post",
      url: `/users/apply/${jobId}`,
      data: { fileId },
    };
    $.ajax(applyReq).then((res) => {
      alert(res.message + ", redirect to job page...");
      window.location.href = `/jobs/id/${jobId}`;
    });
  }
}
